import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { assignments, doctorAvailability, enumStatus } from '@/src/db/drizzle/migrations/schema';
import { eq, and } from 'drizzle-orm';
import { withAuthAndContext, AuthenticatedRequest } from '@/lib/auth/middleware';
import { UpdateAssignmentStatusDtoSchema } from '@/lib/validations/assignment-status.dto';
import { validateRequest } from '@/lib/utils/validate-request';

/**
 * Update assignment status
 * PATCH /api/assignments/[id]/status
 */
async function patchHandler(
  req: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const assignmentId = params.id;
    
    // Validate request body with Zod
    const validation = await validateRequest(req, UpdateAssignmentStatusDtoSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { status, cancellationReason, treatmentNotes } = validation.data;

    const db = getDb();
    const user = (req as any).user;

    // Get the assignment to verify ownership
    const assignment = await db
      .select()
      .from(assignments)
      .where(eq(assignments.id, assignmentId))
      .limit(1);

    if (assignment.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Assignment not found',
        },
        { status: 404 }
      );
    }

    const assignmentData = assignment[0];

    // Verify ownership based on user role
    if (user.userRole === 'doctor') {
      // For doctors, we need to check if the assignment's doctorId matches the doctor's profile
      // Get doctor profile to match userId with doctorId
      const { DoctorsService } = await import('@/lib/services/doctors.service');
      const doctorsService = new DoctorsService();
      const doctorResult = await doctorsService.findDoctorByUserId(user.userId);
      
      if (!doctorResult.success || !doctorResult.data || doctorResult.data.id !== assignmentData.doctorId) {
        return NextResponse.json(
          {
            success: false,
            message: 'You do not have permission to update this assignment',
          },
          { status: 403 }
        );
      }
    } else if (user.userRole === 'hospital') {
      // For hospitals, check if the assignment's hospitalId matches the hospital's profile
      const { HospitalsService } = await import('@/lib/services/hospitals.service');
      const hospitalsService = new HospitalsService();
      const hospitalResult = await hospitalsService.findHospitalByUserId(user.userId);
      
      if (!hospitalResult.success || !hospitalResult.data || hospitalResult.data.id !== assignmentData.hospitalId) {
        return NextResponse.json(
          {
            success: false,
            message: 'You do not have permission to update this assignment',
          },
          { status: 403 }
        );
      }
    }

    // Check if assignment is already in a final state
    // Allow 'cancelled' status even if already 'cancelled' (idempotency)
    // But block updates to 'declined' or 'completed' assignments
    if ((assignmentData.status === 'declined' || assignmentData.status === 'completed') && status !== 'cancelled') {
      return NextResponse.json(
        {
          success: false,
          message: `Assignment is already ${assignmentData.status} and cannot be updated`,
        },
        { status: 400 }
      );
    }

    // Only allow 'completed' status if assignment is already 'accepted'
    if (status === 'completed' && assignmentData.status !== 'accepted') {
      return NextResponse.json(
        {
          success: false,
          message: 'Assignment must be accepted before it can be marked as completed',
        },
        { status: 400 }
      );
    }

    // Only allow 'cancelled' status if assignment is 'pending' or 'accepted'
    if (status === 'cancelled' && assignmentData.status !== 'pending' && assignmentData.status !== 'accepted') {
      return NextResponse.json(
        {
          success: false,
          message: `Assignment cannot be cancelled from ${assignmentData.status} status`,
        },
        { status: 400 }
      );
    }

    // Check if assignment has expired (only for pending assignments)
    if (status === 'accepted' && assignmentData.status === 'pending' && assignmentData.expiresAt) {
      const expiresAt = new Date(assignmentData.expiresAt);
      const now = new Date();
      if (expiresAt < now) {
        return NextResponse.json(
          {
            success: false,
            message: 'This assignment has expired and can no longer be accepted. Please contact the hospital for a new assignment.',
          },
          { status: 400 }
        );
      }
    }

    // Verify status exists in enum_status table, insert if it doesn't
    const statusCheck = await db
      .select()
      .from(enumStatus)
      .where(eq(enumStatus.status, status))
      .limit(1);

    if (statusCheck.length === 0) {
      // Insert status if it doesn't exist
      await db.insert(enumStatus).values({
        status,
        description: `${status} assignment status`,
      }).onConflictDoNothing();
    }

    // Update assignment status
    const updateData: any = {
      status,
    };

    if (status === 'accepted') {
      updateData.actualStartTime = new Date().toISOString();
    } else if (status === 'declined') {
      updateData.cancelledAt = new Date().toISOString();
      updateData.cancelledBy = 'doctor';
      if (cancellationReason) {
        updateData.cancellationReason = cancellationReason;
      }
    } else if (status === 'cancelled') {
      updateData.cancelledAt = new Date().toISOString();
      // Set cancelledBy based on user role
      updateData.cancelledBy = user.userRole === 'hospital' ? 'hospital' : 'doctor';
      if (cancellationReason) {
        updateData.cancellationReason = cancellationReason;
      }
    } else if (status === 'completed') {
      updateData.completedAt = new Date().toISOString();
      updateData.actualEndTime = new Date().toISOString();
      if (treatmentNotes) {
        updateData.treatmentNotes = treatmentNotes;
      }
    }

    const updatedAssignment = await db
      .update(assignments)
      .set(updateData)
      .where(eq(assignments.id, assignmentId))
      .returning();

    // Release or delete availability slot for declined or cancelled assignments
    if ((status === 'declined' || status === 'cancelled') && assignmentData.availabilitySlotId) {
      // Check if this is a sub-slot (has parentSlotId) or a parent slot
      const slotInfo = await db
        .select({
          id: doctorAvailability.id,
          parentSlotId: doctorAvailability.parentSlotId,
        })
        .from(doctorAvailability)
        .where(eq(doctorAvailability.id, assignmentData.availabilitySlotId))
        .limit(1);

      if (slotInfo.length > 0) {
        const slot = slotInfo[0];
        
        if (slot.parentSlotId) {
          // This is a sub-slot: delete it
          await db
            .delete(doctorAvailability)
            .where(eq(doctorAvailability.id, assignmentData.availabilitySlotId));
        } else {
          // This is a parent slot: just release it (set to available)
          await db
            .update(doctorAvailability)
            .set({
              status: 'available',
              bookedByHospitalId: null,
              bookedAt: null,
            })
            .where(eq(doctorAvailability.id, assignmentData.availabilitySlotId));
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedAssignment[0],
      message: `Assignment ${status} successfully`,
    });
  } catch (error) {
    console.error('Error updating assignment status:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update assignment status',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const PATCH = withAuthAndContext(patchHandler, ['doctor', 'hospital', 'admin']);

