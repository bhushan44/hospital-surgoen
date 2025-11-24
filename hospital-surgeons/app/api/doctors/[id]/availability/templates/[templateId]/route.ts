import { NextResponse } from 'next/server';
import { DoctorsService } from '@/lib/services/doctors.service';
import { withAuthAndContext, AuthenticatedRequest } from '@/lib/auth/middleware';

const doctorsService = new DoctorsService();

async function patchHandler(
  req: AuthenticatedRequest,
  context: { params: Promise<{ id: string; templateId: string }> }
) {
  try {
    const params = await context.params;
    const body = await req.json();
    const result = await doctorsService.updateAvailabilityTemplate(params.id, params.templateId, body);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

async function deleteHandler(
  _req: AuthenticatedRequest,
  context: { params: Promise<{ id: string; templateId: string }> }
) {
  try {
    const params = await context.params;
    const result = await doctorsService.deleteAvailabilityTemplate(params.id, params.templateId);
    return NextResponse.json(result, { status: result.success ? 200 : 404 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

export const PATCH = withAuthAndContext(patchHandler, ['doctor', 'admin']);
export const DELETE = withAuthAndContext(deleteHandler, ['doctor', 'admin']);

