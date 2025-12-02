import { NextResponse } from 'next/server';
import { generateAvailabilityFromTemplates } from '@/lib/jobs/generateAvailabilityFromTemplates';
import { withAuthAndContext, AuthenticatedRequest } from '@/lib/auth/middleware';

/**
 * @swagger
 * /api/doctors/{id}/availability/templates/generate:
 *   post:
 *     summary: Generate availability slots from templates for a doctor
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Availability slots generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   description: Summary of generated slots
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Failed to generate slots
 */
async function postHandler(
  _req: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const summary = await generateAvailabilityFromTemplates({ doctorIds: [params.id] });
    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to generate slots', error: String(error) },
      { status: 500 }
    );
  }
}

export const POST = withAuthAndContext(postHandler, ['doctor', 'admin']);


