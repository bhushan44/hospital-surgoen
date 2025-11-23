import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { assignments, doctors, patients, hospitals, doctorAvailability, enumPriority } from '@/src/db/drizzle/migrations/schema';
import { eq, and, or, sql, desc, asc, gte, lte } from 'drizzle-orm';
import { withAuthAndContext, AuthenticatedRequest } from '@/lib/auth/middleware';

/**
 * Get all assignments for a doctor
 * GET /api/doctors/[id]/assignments
 */
async function getHandler(
  req: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const doctorId = params.id;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(doctorId)) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }
    
    const db = getDb();
    const searchParams = req.nextUrl.searchParams;

    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const todayOnly = searchParams.get('todayOnly') === 'true';

    // Build where conditions
    const conditions = [eq(assignments.doctorId, doctorId)];
    if (status && status !== 'all') {
      conditions.push(eq(assignments.status, status));
    }

    // Filter by today's date if requested
    if (todayOnly) {
      const today = new Date().toISOString().split('T')[0];
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM doctor_availability 
          WHERE id = ${assignments.availabilitySlotId} 
          AND slot_date = ${today}::date
        )`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get assignments with related data
    const assignmentsList = await db
      .select({
        id: assignments.id,
        patientId: assignments.patientId,
        hospitalId: assignments.hospitalId,
        priority: assignments.priority,
        status: assignments.status,
        requestedAt: assignments.requestedAt,
        expiresAt: assignments.expiresAt,
        actualStartTime: assignments.actualStartTime,
        actualEndTime: assignments.actualEndTime,
        completedAt: assignments.completedAt,
        cancelledAt: assignments.cancelledAt,
        cancellationReason: assignments.cancellationReason,
        consultationFee: assignments.consultationFee,
        // Patient info
        patientName: sql<string>`(SELECT full_name FROM patients WHERE id = ${assignments.patientId})`,
        patientCondition: sql<string>`(SELECT medical_condition FROM patients WHERE id = ${assignments.patientId})`,
        // Hospital info
        hospitalName: sql<string>`(SELECT name FROM hospitals WHERE id = ${assignments.hospitalId})`,
        // Slot info
        slotDate: sql<string>`(SELECT slot_date::text FROM doctor_availability WHERE id = ${assignments.availabilitySlotId})`,
        slotTime: sql<string>`(SELECT start_time::text FROM doctor_availability WHERE id = ${assignments.availabilitySlotId})`,
        slotEndTime: sql<string>`(SELECT end_time::text FROM doctor_availability WHERE id = ${assignments.availabilitySlotId})`,
      })
      .from(assignments)
      .where(whereClause)
      .orderBy(desc(assignments.requestedAt));

    // Format response
    let formattedAssignments = assignmentsList.map((assignment) => {
      const date = assignment.slotDate || (assignment.requestedAt ? new Date(assignment.requestedAt).toISOString().split('T')[0] : null);
      const time = assignment.slotTime || 'TBD';
      const endTime = assignment.slotEndTime || null;

      // Format time
      let formattedTime = time;
      if (time !== 'TBD' && time.includes(':')) {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        formattedTime = `${displayHour}:${minutes} ${ampm}`;
      }

      // Calculate expiresIn for pending assignments
      let expiresIn = null;
      if (assignment.status === 'pending' && assignment.expiresAt) {
        const expires = new Date(assignment.expiresAt);
        const now = new Date();
        const diffMs = expires.getTime() - now.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours > 0) {
          expiresIn = `${diffHours}h`;
        } else {
          const diffMinutes = Math.floor(diffMs / (1000 * 60));
          if (diffMinutes > 0) {
            expiresIn = `${diffMinutes}m`;
          }
        }
      }

      return {
        id: assignment.id,
        patient: assignment.patientName || 'Unknown',
        condition: assignment.patientCondition || 'N/A',
        hospital: assignment.hospitalName || 'Unknown',
        date,
        time: formattedTime,
        endTime: endTime ? (() => {
          const [hours, minutes] = endTime.split(':');
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
          return `${displayHour}:${minutes} ${ampm}`;
        })() : null,
        status: assignment.status,
        priority: assignment.priority || 'routine',
        createdAt: assignment.requestedAt,
        acceptedAt: assignment.status === 'accepted' && assignment.actualStartTime ? assignment.actualStartTime : null,
        declinedAt: assignment.status === 'declined' && assignment.cancelledAt ? assignment.cancelledAt : null,
        completedAt: assignment.completedAt,
        expiresIn,
        fee: assignment.consultationFee ? Number(assignment.consultationFee) : 0,
        declineReason: assignment.cancellationReason,
        hospitalId: assignment.hospitalId,
        patientId: assignment.patientId,
      };
    });

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      formattedAssignments = formattedAssignments.filter(
        (a) =>
          a.patient.toLowerCase().includes(searchLower) ||
          a.hospital.toLowerCase().includes(searchLower) ||
          a.condition.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: formattedAssignments,
    });
  } catch (error) {
    console.error('Error fetching doctor assignments:', error);
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

export const GET = withAuthAndContext(getHandler, ['doctor', 'admin']);

