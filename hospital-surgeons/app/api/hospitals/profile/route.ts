import { NextRequest, NextResponse } from 'next/server';
import { HospitalsService } from '@/lib/services/hospitals.service';
import { withAuth } from '@/lib/auth/middleware';

async function handler(req: NextRequest) {
  try {
    const user = (req as any).user;
    const hospitalsService = new HospitalsService();
    const result = await hospitalsService.findHospitalByUserId(user.userId);
    
    return NextResponse.json(result, { status: result.success ? 200 : 404 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);













