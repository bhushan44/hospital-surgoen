import { NextRequest, NextResponse } from 'next/server';
import { DoctorsService } from '@/lib/services/doctors.service';
import { withAuthAndContext, AuthenticatedRequest } from '@/lib/auth/middleware';

async function deleteHandler(
  req: AuthenticatedRequest,
  context: { params: Promise<{ id: string; specialtyId: string }> }
) {
  try {
    const params = await context.params;
    const doctorsService = new DoctorsService();
    const result = await doctorsService.removeSpecialty(params.id, params.specialtyId);
    
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

export const DELETE = withAuthAndContext(deleteHandler, ['doctor', 'admin']);

