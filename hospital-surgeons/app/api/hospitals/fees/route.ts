import { NextRequest, NextResponse } from 'next/server';
import { FeesService } from '@/lib/services/fees.service';
import { HospitalsService } from '@/lib/services/hospitals.service';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

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
