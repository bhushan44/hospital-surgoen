import { NextRequest, NextResponse } from 'next/server';
import { HospitalsService } from '@/lib/services/hospitals.service';
import { withAuthAndContext, AuthenticatedRequest } from '@/lib/auth/middleware';

async function patchHandler(
  req: AuthenticatedRequest,
  context: { params: Promise<{ id: string; staffId: string }> }
) {
  try {
    const params = await context.params;
    const body = await req.json();
    const hospitalsService = new HospitalsService();
    const result = await hospitalsService.updateStaff(params.staffId, body);
    
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

async function deleteHandler(
  req: AuthenticatedRequest,
  context: { params: Promise<{ id: string; staffId: string }> }
) {
  try {
    const params = await context.params;
    const hospitalsService = new HospitalsService();
    const result = await hospitalsService.deleteStaff(params.staffId);
    
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

export const PATCH = withAuthAndContext(patchHandler, ['hospital', 'admin']);
export const DELETE = withAuthAndContext(deleteHandler, ['hospital', 'admin']);

