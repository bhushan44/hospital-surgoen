import { NextRequest, NextResponse } from 'next/server';
import { DoctorsService } from '@/lib/services/doctors.service';
import { withAuthAndContext, AuthenticatedRequest } from '@/lib/auth/middleware';

/**
 * @swagger
 * /api/doctors/{id}/availability:
 *   get:
 *     summary: Get all availability slots for a doctor
 *     tags: [Doctors]
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
 *         description: Availability slots retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       doctorId:
 *                         type: string
 *                         format: uuid
 *                       slotDate:
 *                         type: string
 *                         format: date
 *                       startTime:
 *                         type: string
 *                         format: time
 *                       endTime:
 *                         type: string
 *                         format: time
 *                       status:
 *                         type: string
 *                         enum: [available, booked, blocked]
 *                       isManual:
 *                         type: boolean
 *       400:
 *         description: Bad request
 *   post:
 *     summary: Create a new availability slot for a doctor
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slotDate
 *               - startTime
 *               - endTime
 *             properties:
 *               slotDate:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *                 format: time
 *               endTime:
 *                 type: string
 *                 format: time
 *               templateId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               status:
 *                 type: string
 *                 enum: [available, booked, blocked]
 *                 default: available
 *               isManual:
 *                 type: boolean
 *                 default: false
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Availability slot created successfully
 *       400:
 *         description: Bad request (overlapping slot or invalid data)
 *       403:
 *         description: Insufficient permissions
 */
async function getHandler(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const doctorsService = new DoctorsService();
    const result = await doctorsService.getDoctorAvailability(params.id);
    
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

async function postHandler(req: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const body = await req.json();
    const doctorsService = new DoctorsService();
    const result = await doctorsService.addAvailability(params.id, body);
    
    return NextResponse.json(result, { status: result.success ? 201 : 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

export const GET = getHandler;
export const POST = withAuthAndContext(postHandler, ['doctor', 'admin']);

