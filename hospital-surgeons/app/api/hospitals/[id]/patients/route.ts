import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { patients, assignments, doctors, doctorSpecialties, specialties, hospitals, users, patientConsents } from '@/src/db/drizzle/migrations/schema';
import { eq, and, or, like, sql, desc, asc, max } from 'drizzle-orm';
import { createAuditLog, getRequestMetadata } from '@/lib/utils/audit-logger';

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

    // First, get all patients
    const patientsList = await db
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
      })
      .from(patients)
      .where(eq(patients.hospitalId, hospitalId))
      .orderBy(desc(patients.createdAt));

    // Then, for each patient, get the latest assignment with doctor info
    const patientsWithAssignments = await Promise.all(
      patientsList.map(async (patient) => {
        // Get latest assignment for this patient
        const latestAssignment = await db
          .select({
            id: assignments.id,
            status: assignments.status,
            doctorId: assignments.doctorId,
            requestedAt: assignments.requestedAt,
          })
          .from(assignments)
          .where(eq(assignments.patientId, patient.id))
          .orderBy(desc(assignments.requestedAt))
          .limit(1);

        if (latestAssignment.length === 0) {
          return {
            ...patient,
            assignmentStatus: null,
            doctorId: null,
            doctorFirstName: null,
            doctorLastName: null,
            specialtyName: null,
          };
        }

        const assignment = latestAssignment[0];

        // Get doctor info
        const doctorInfo = await db
          .select({
            id: doctors.id,
            firstName: doctors.firstName,
            lastName: doctors.lastName,
          })
          .from(doctors)
          .where(eq(doctors.id, assignment.doctorId))
          .limit(1);

        // Get specialty
        let specialtyName = null;
        if (doctorInfo.length > 0) {
          const specialty = await db
            .select({
              name: specialties.name,
            })
            .from(specialties)
            .innerJoin(doctorSpecialties, eq(specialties.id, doctorSpecialties.specialtyId))
            .where(eq(doctorSpecialties.doctorId, assignment.doctorId))
            .limit(1);

          specialtyName = specialty[0]?.name || null;
        }

        return {
          ...patient,
          assignmentStatus: assignment.status,
          doctorId: assignment.doctorId,
          doctorFirstName: doctorInfo[0]?.firstName || null,
          doctorLastName: doctorInfo[0]?.lastName || null,
          specialtyName: specialtyName,
        };
      })
    );

    // Format and filter results
    let formattedPatients = patientsWithAssignments.map((patient) => {
      const age = patient.dateOfBirth
        ? Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null;

      const assignedDoctor = patient.doctorId
        ? `Dr. ${patient.doctorFirstName || ''} ${patient.doctorLastName || ''}`.trim()
        : null;

      // Determine status based on latest assignment
      let patientStatus = 'unassigned';
      if (patient.assignmentStatus) {
        // If there's a latest assignment, use its status
        if (patient.assignmentStatus === 'accepted') {
          patientStatus = 'assigned';
        } else if (patient.assignmentStatus === 'declined') {
          patientStatus = 'declined';
        } else if (patient.assignmentStatus === 'pending') {
          patientStatus = 'pending';
        } else if (patient.assignmentStatus === 'completed') {
          patientStatus = 'completed';
        } else {
          // For any other status, show it as-is
          patientStatus = patient.assignmentStatus;
        }
      }
      // If assignmentStatus is null, patientStatus remains 'unassigned'

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
    
    // Validate request body with Zod
    const { CreatePatientDtoSchema } = await import('@/lib/validations/patient.dto');
    const { validateRequest } = await import('@/lib/utils/validate-request');
    
    const validation = await validateRequest(req, CreatePatientDtoSchema);
    if (!validation.success) {
      return validation.response;
    }

    const body = validation.data;
    const db = getDb();
    
    // Check hospital patient limit before creating
    const { HospitalUsageService } = await import('@/lib/services/hospital-usage.service');
    const hospitalUsageService = new HospitalUsageService();
    
    try {
      await hospitalUsageService.checkPatientLimit(hospitalId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage === 'PATIENT_LIMIT_REACHED') {
        // Get current usage for better error message
        try {
          const usage = await hospitalUsageService.getUsage(hospitalId);
          return NextResponse.json(
            {
              success: false,
              message: `You have reached your monthly patient limit (${usage.patients.used}/${usage.patients.limit === -1 ? 'unlimited' : usage.patients.limit} patients used). Your limit will reset on ${new Date(usage.resetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}. Upgrade your plan to add more patients now.`,
              error: 'PATIENT_LIMIT_REACHED',
              code: 'PATIENT_LIMIT_REACHED',
              usage: {
                used: usage.patients.used,
                limit: usage.patients.limit,
                resetDate: usage.resetDate,
              },
            },
            { status: 403 }
          );
        } catch {
          // Fallback if usage fetch fails
          return NextResponse.json(
            {
              success: false,
              message: 'You have reached your monthly patient limit. Upgrade your plan to add more patients.',
              error: 'PATIENT_LIMIT_REACHED',
              code: 'PATIENT_LIMIT_REACHED',
            },
            { status: 403 }
          );
        }
      }
      throw error;
    }
    
    // Room type is already normalized by Zod transform
    const roomType = body.roomType;

    // Get hospital info for audit log
    const hospitalResult = await db
      .select({
        name: hospitals.name,
        userId: hospitals.userId,
        userEmail: users.email,
      })
      .from(hospitals)
      .leftJoin(users, eq(hospitals.userId, users.id))
      .where(eq(hospitals.id, hospitalId))
      .limit(1);

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

    // Save consent records if provided
    if (body.consentGiverName && body.relationship) {
      const consentRecords = [];
      
      // Data Privacy Consent
      if (body.dataPrivacy) {
        consentRecords.push({
          patientId: newPatient[0].id,
          consentType: 'data_sharing',
          granted: true,
          grantedBy: body.consentGiverName,
          relationToPatient: body.relationship,
        });
      }
      
      // Doctor Assignment Consent
      if (body.doctorAssignment) {
        consentRecords.push({
          patientId: newPatient[0].id,
          consentType: 'treatment',
          granted: true,
          grantedBy: body.consentGiverName,
          relationToPatient: body.relationship,
        });
      }
      
      // Treatment Consent
      if (body.treatmentConsent) {
        consentRecords.push({
          patientId: newPatient[0].id,
          consentType: 'treatment',
          granted: true,
          grantedBy: body.consentGiverName,
          relationToPatient: body.relationship,
        });
      }
      
      // Insert all consent records
      if (consentRecords.length > 0) {
        try {
          // Insert consent records one by one to avoid any array issues
          for (const consent of consentRecords) {
            await db.insert(patientConsents).values({
              patientId: consent.patientId,
              consentType: consent.consentType,
              granted: consent.granted,
              grantedBy: consent.grantedBy,
              relationToPatient: consent.relationToPatient || null,
            });
          }
        } catch (consentError) {
          console.error('Error saving consent records:', consentError);
          // Don't fail the patient creation if consent saving fails
          // But log it for debugging
        }
      }
    }

    // Increment patient usage after successful creation
    try {
      await hospitalUsageService.incrementPatientUsage(hospitalId);
    } catch (error) {
      console.error('Error incrementing patient usage:', error);
      // Don't fail the request if usage increment fails
    }

    // Get request metadata for audit log
    const metadata = getRequestMetadata(req);
    const hospitalUserId = hospitalResult[0]?.userId || null;

    // Create comprehensive audit log
    await createAuditLog({
      userId: hospitalUserId,
      actorType: 'user',
      action: 'create',
      entityType: 'patient',
      entityId: newPatient[0].id,
      entityName: newPatient[0].fullName,
      httpMethod: 'POST',
      endpoint: `/api/hospitals/${hospitalId}/patients`,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      details: {
        hospitalId,
        hospitalName: hospitalResult[0]?.name || null,
        hospitalEmail: hospitalResult[0]?.userEmail || null,
        patientName: newPatient[0].fullName,
        gender: newPatient[0].gender,
        roomType: newPatient[0].roomType,
        createdAt: new Date().toISOString(),
      },
    });

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

