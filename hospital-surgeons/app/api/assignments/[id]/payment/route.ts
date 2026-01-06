import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { assignments, assignmentPayments } from '@/src/db/drizzle/migrations/schema';
import { eq } from 'drizzle-orm';
import { withAuthAndContext, AuthenticatedRequest } from '@/lib/auth/middleware';

/**
 * @swagger
 * /api/assignments/{id}/payment:
 *   get:
 *     summary: Get payment details for an assignment
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assignment ID
 *     responses:
 *       200:
 *         description: Payment details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     assignmentId:
 *                       type: string
 *                       format: uuid
 *                     hospitalId:
 *                       type: string
 *                       format: uuid
 *                     doctorId:
 *                       type: string
 *                       format: uuid
 *                     consultationFee:
 *                       type: string
 *                       format: numeric
 *                     platformCommission:
 *                       type: string
 *                       format: numeric
 *                     doctorPayout:
 *                       type: string
 *                       format: numeric
 *                     paymentStatus:
 *                       type: string
 *                       enum: [pending, processing, completed, failed]
 *                     paidToDoctorAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Internal server error
 *   patch:
 *     summary: Mark payment as completed
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assignment ID
 *     responses:
 *       200:
 *         description: Payment marked as completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       403:
 *         description: Only hospital and admin can mark payment as completed
 *       404:
 *         description: Assignment or payment not found
 *       500:
 *         description: Internal server error
 */
async function getHandler(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const assignmentId = params.id;
    const db = getDb();

    // Get payment record
    const payment = await db
      .select()
      .from(assignmentPayments)
      .where(eq(assignmentPayments.assignmentId, assignmentId))
      .limit(1);

    if (payment.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Payment not found for this assignment',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: payment[0],
    });
  } catch (error) {
    console.error('Error fetching assignment payment:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch payment',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Mark payment as completed
 * PATCH /api/assignments/{id}/payment
 * Only hospital/admin can mark payment as completed
 */
async function patchHandler(
  req: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const assignmentId = params.id;
    const db = getDb();
    const user = (req as any).user;

    // Only hospital and admin can mark payment as completed
    if (user.userRole !== 'hospital' && user.userRole !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          message: 'Only hospital and admin can mark payment as completed',
        },
        { status: 403 }
      );
    }

    // Get assignment to verify ownership (for hospital)
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

    // Verify hospital owns this assignment (unless admin)
    if (user.userRole === 'hospital') {
      const { HospitalsService } = await import('@/lib/services/hospitals.service');
      const hospitalsService = new HospitalsService();
      const hospitalResult = await hospitalsService.findHospitalByUserId(user.userId);
      
      if (!hospitalResult.success || !hospitalResult.data || hospitalResult.data.id !== assignment[0].hospitalId) {
        return NextResponse.json(
          {
            success: false,
            message: 'You do not have permission to update this payment',
          },
          { status: 403 }
        );
      }
    }

    // Get payment record
    const payment = await db
      .select()
      .from(assignmentPayments)
      .where(eq(assignmentPayments.assignmentId, assignmentId))
      .limit(1);

    if (payment.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Payment not found for this assignment',
        },
        { status: 404 }
      );
    }

    // Update payment status to completed
    const now = new Date().toISOString();
    const updatedPayment = await db
      .update(assignmentPayments)
      .set({
        paymentStatus: 'completed',
        paidToDoctorAt: now,
      })
      .where(eq(assignmentPayments.assignmentId, assignmentId))
      .returning();

    // Update assignment paidAt timestamp
    await db
      .update(assignments)
      .set({
        paidAt: now,
      })
      .where(eq(assignments.id, assignmentId));

    return NextResponse.json({
      success: true,
      data: updatedPayment[0],
      message: 'Payment marked as completed successfully',
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update payment status',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const GET = getHandler;
export const PATCH = withAuthAndContext(patchHandler, ['hospital', 'admin', 'doctor']);

