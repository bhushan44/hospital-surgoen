import { NextRequest, NextResponse } from 'next/server';
import { FeesService } from '@/lib/services/fees.service';
import { HospitalsService } from '@/lib/services/hospitals.service';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

/**
 * @swagger
 * /api/hospitals/fees:
 *   get:
 *     summary: Get all proposed doctor fees for the hospital
 *     description: Retrieves a list of doctor-proposed fees that are specifically meant for the authenticated hospital. Ignore base MRP fees.
 *     tags: [Hospital Fees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of proposed hospital fees
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
 *                       doctorName:
 *                         type: string
 *                       specialtyId:
 *                         type: string
 *                         format: uuid
 *                       specialtyName:
 *                         type: string
 *                       procedureId:
 *                         type: string
 *                         format: uuid
 *                       procedureName:
 *                         type: string
 *                       procedureTypeId:
 *                         type: string
 *                         format: uuid
 *                       procedureTypeName:
 *                         type: string
 *                       roomTypeId:
 *                         type: string
 *                         format: uuid
 *                       roomTypeName:
 *                         type: string
 *                       fee:
 *                         type: string
 *                       discountPercentage:
 *                         type: string
 *                       status:
 *                         type: string
 *                       statusReason:
 *                         type: string
 *       404:
 *         description: Hospital profile not found
 *       500:
 *         description: Internal server error
 */
async function handler(req: AuthenticatedRequest) {
  try {
    const user = req.user!;

    const hospitalsService = new HospitalsService();
    const hospitalResult = await hospitalsService.findHospitalByUserId(user.userId);

    if (!hospitalResult.success || !hospitalResult.data) {
      return NextResponse.json({ success: false, message: 'Hospital profile not found' }, { status: 404 });
    }

    const hospitalId = (hospitalResult.data as any).id;
    const feesService = new FeesService();
    const result = await feesService.getHospitalFees(hospitalId);

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error('Error in GET /api/hospitals/fees:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withAuth(handler, ['hospital']);
