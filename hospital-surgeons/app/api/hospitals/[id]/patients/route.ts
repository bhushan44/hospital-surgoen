import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { patients, assignments, doctors, doctorSpecialties, specialties } from '@/src/db/drizzle/migrations/schema';
import { eq, and, or, like, sql, desc, asc } from 'drizzle-orm';

/**
 * Get all patients for a hospital
 * GET /api/hospitals/[id]/patients
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const hospitalId = params.id;
    
    // Validate UUID format - return empty data for placeholder
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(hospitalId) || hospitalId === 'hospital-id-placeholder') {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }
    
    const db = getDb();
    const searchParams = req.nextUrl.searchParams;

    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined; // 'assigned', 'unassigned', 'declined'

    // Build query
    let query = db
      .select({
        id: patients.id,
        fullName: patients.fullName,
        dateOfBirth: patients.dateOfBirth,
        gender: patients.gender,
        phone: patients.phone,
        emergencyContact: patients.emergencyContact,
        address: patients.address,
        medicalCondition: patients.medicalCondition,
        roomType: patients.roomType,
        costPerDay: patients.costPerDay,
        medicalNotes: patients.medicalNotes,
        createdAt: patients.createdAt,
        // Get assigned doctor info
        assignmentId: sql<string | null>`(SELECT id FROM assignments WHERE patient_id = ${patients.id} AND status = 'accepted' LIMIT 1)`,
        doctorId: sql<string | null>`(SELECT doctor_id FROM assignments WHERE patient_id = ${patients.id} AND status = 'accepted' LIMIT 1)`,
        doctorFirstName: sql<string | null>`(SELECT first_name FROM doctors WHERE id = (SELECT doctor_id FROM assignments WHERE patient_id = ${patients.id} AND status = 'accepted' LIMIT 1))`,
        doctorLastName: sql<string | null>`(SELECT last_name FROM doctors WHERE id = (SELECT doctor_id FROM assignments WHERE patient_id = ${patients.id} AND status = 'accepted' LIMIT 1))`,
        // Get specialty
        specialtyName: sql<string | null>`(SELECT name FROM specialties WHERE id = (SELECT specialty_id FROM doctor_specialties WHERE doctor_id = (SELECT doctor_id FROM assignments WHERE patient_id = ${patients.id} AND status = 'accepted' LIMIT 1) LIMIT 1))`,
        // Get assignment status
        assignmentStatus: sql<string | null>`(SELECT status FROM assignments WHERE patient_id = ${patients.id} ORDER BY requested_at DESC LIMIT 1)`,
      })
      .from(patients)
      .where(eq(patients.hospitalId, hospitalId))
      .orderBy(desc(patients.createdAt));

    const patientsList = await query;

    // Format and filter results
    let formattedPatients = patientsList.map((patient) => {
      const age = patient.dateOfBirth
        ? Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null;

      const assignedDoctor = patient.doctorId
        ? `Dr. ${patient.doctorFirstName || ''} ${patient.doctorLastName || ''}`.trim()
        : null;

      // Determine status
      let patientStatus = 'unassigned';
      if (patient.assignmentStatus === 'accepted') {
        patientStatus = 'assigned';
      } else if (patient.assignmentStatus === 'declined') {
        patientStatus = 'declined';
      } else if (patient.assignmentStatus === 'pending') {
        patientStatus = 'pending';
      }

      return {
        id: patient.id,
        name: patient.fullName,
        age: age || 0,
        gender: patient.gender || 'N/A',
        admissionDate: patient.createdAt ? new Date(patient.createdAt).toISOString().split('T')[0] : null,
        condition: patient.medicalCondition || 'N/A',
        specialty: patient.specialtyName || 'General Medicine',
        assignedDoctor,
        status: patientStatus,
      };
    });

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      formattedPatients = formattedPatients.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.condition.toLowerCase().includes(searchLower) ||
          p.specialty.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (status) {
      formattedPatients = formattedPatients.filter((p) => p.status === status);
    }

    return NextResponse.json({
      success: true,
      data: formattedPatients,
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch patients',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Create a new patient
 * POST /api/hospitals/[id]/patients
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const hospitalId = params.id;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(hospitalId) || hospitalId === 'hospital-id-placeholder') {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid hospital ID',
        },
        { status: 400 }
      );
    }
    
    const db = getDb();
    const body = await req.json();

    // Normalize room type to match database constraint
    // Database allows: 'general', 'private', 'semi_private', 'icu', 'emergency'
    const validRoomTypes = ['general', 'private', 'semi_private', 'icu', 'emergency'];
    let roomType = body.roomType;
    
    // Convert hyphen to underscore for semi-private
    if (roomType === 'semi-private') {
      roomType = 'semi_private';
    }
    
    // Validate room type
    if (!validRoomTypes.includes(roomType)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid room type. Allowed values: ${validRoomTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const newPatient = await db
      .insert(patients)
      .values({
        hospitalId,
        fullName: body.fullName,
        dateOfBirth: body.dateOfBirth,
        gender: body.gender,
        phone: body.phone,
        emergencyContact: body.emergencyContact,
        address: body.address,
        medicalCondition: body.condition || body.medicalCondition,
        roomType: roomType,
        costPerDay: body.costPerDay ? String(body.costPerDay) : null,
        medicalNotes: body.medicalNotes,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newPatient[0],
      message: 'Patient created successfully',
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create patient',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

