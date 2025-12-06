import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { assignments, doctors, patients, doctorAvailability, enumPriority } from '@/src/db/drizzle/migrations/schema';
import { eq, and, or, sql, desc, asc } from 'drizzle-orm';
import { withAuthAndContext, AuthenticatedRequest } from '@/lib/auth/middleware';

/**
 * Get all assignments for a hospital
 * GET /api/hospitals/[id]/assignments
 */
async function getHandler(
  req: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!context || !context.params) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request context',
        },
        { status: 400 }
      );
    }
    
    const params = await context.params;
    const hospitalId = params.id;
    
    // Validate UUID format - return empty data for placeholder
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(hospitalId) || hospitalId === 'hospital-id-placeholder') {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });
    }
    
    const db = getDb();
    const searchParams = req.nextUrl.searchParams;

    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    // Build where conditions
    const conditions = [eq(assignments.hospitalId, hospitalId)];
    if (status && status !== 'all') {
      conditions.push(eq(assignments.status, status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get assignments with related data
    const assignmentsList = await db
      .select({
        id: assignments.id,
        patientId: assignments.patientId,
        doctorId: assignments.doctorId,
        priority: assignments.priority,
        status: assignments.status,
        requestedAt: assignments.requestedAt,
        expiresAt: assignments.expiresAt,
        actualStartTime: assignments.actualStartTime,
        actualEndTime: assignments.actualEndTime,
        completedAt: assignments.completedAt,
        cancelledAt: assignments.cancelledAt,
        cancellationReason: assignments.cancellationReason,
        treatmentNotes: assignments.treatmentNotes,
        consultationFee: assignments.consultationFee,
        // Patient info
        patientName: sql<string>`(SELECT full_name FROM patients WHERE id = ${assignments.patientId})`,
        patientCondition: sql<string>`(SELECT medical_condition FROM patients WHERE id = ${assignments.patientId})`,
        // Doctor info
        doctorFirstName: sql<string>`(SELECT first_name FROM doctors WHERE id = ${assignments.doctorId})`,
        doctorLastName: sql<string>`(SELECT last_name FROM doctors WHERE id = ${assignments.doctorId})`,
        specialtyName: sql<string>`(SELECT name FROM specialties WHERE id = (SELECT specialty_id FROM doctor_specialties WHERE doctor_id = ${assignments.doctorId} LIMIT 1))`,
        // Slot info
        slotDate: sql<string>`(SELECT slot_date::text FROM doctor_availability WHERE id = ${assignments.availabilitySlotId})`,
        slotTime: sql<string>`(SELECT start_time::text FROM doctor_availability WHERE id = ${assignments.availabilitySlotId})`,
      })
      .from(assignments)
      .where(whereClause)
      .orderBy(desc(assignments.requestedAt));

    // Format response
    let formattedAssignments = assignmentsList.map((assignment) => {
      const date = assignment.slotDate || (assignment.requestedAt ? new Date(assignment.requestedAt).toISOString().split('T')[0] : null);
      const time = assignment.slotTime || 'TBD';

      // Calculate expiresIn for pending assignments
      let expiresIn = null;
      if (assignment.status === 'pending' && assignment.expiresAt) {
        const expires = new Date(assignment.expiresAt);
        const now = new Date();
        const diffMs = expires.getTime() - now.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours > 0) {
          expiresIn = `${diffHours}h`;
        }
      }

      return {
        id: assignment.id,
        patient: assignment.patientName || 'Unknown',
        condition: assignment.patientCondition || 'N/A',
        doctor: `Dr. ${assignment.doctorFirstName || ''} ${assignment.doctorLastName || ''}`.trim(),
        specialty: assignment.specialtyName || 'General',
        date,
        time,
        status: assignment.status,
        priority: assignment.priority || 'routine',
        createdAt: assignment.requestedAt,
        acceptedAt: assignment.status === 'accepted' && assignment.actualStartTime ? assignment.actualStartTime : null,
        declinedAt: assignment.status === 'declined' && assignment.cancelledAt ? assignment.cancelledAt : null,
        completedAt: assignment.completedAt,
        expiresIn,
        fee: assignment.consultationFee ? Number(assignment.consultationFee) : 0,
        declineReason: assignment.cancellationReason,
        treatmentNotes: assignment.treatmentNotes,
      };
    });

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      formattedAssignments = formattedAssignments.filter(
        (a) =>
          a.patient.toLowerCase().includes(searchLower) ||
          a.doctor.toLowerCase().includes(searchLower) ||
          a.condition.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: formattedAssignments,
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch assignments',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const GET = withAuthAndContext(getHandler, ['hospital', 'admin']);

