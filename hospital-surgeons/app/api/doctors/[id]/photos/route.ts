import { NextRequest, NextResponse } from 'next/server';
import { DoctorsService } from '@/lib/services/doctors.service';
import { withAuthAndContext, AuthenticatedRequest } from '@/lib/auth/middleware';

async function getHandler(req: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: doctorId } = await context.params;
    const doctorsService = new DoctorsService();

    const authorizationResult = await ensureDoctorAccess(req, doctorId, doctorsService);
    if (!authorizationResult.allowed) {
      return NextResponse.json(
        { success: false, message: authorizationResult.message },
        { status: authorizationResult.status }
      );
    }

    const result = await doctorsService.getDoctorProfilePhotos(doctorId);
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
    const { id: doctorId } = await context.params;
    const doctorsService = new DoctorsService();

    const authorizationResult = await ensureDoctorAccess(req, doctorId, doctorsService);
    if (!authorizationResult.allowed) {
      return NextResponse.json(
        { success: false, message: authorizationResult.message },
        { status: authorizationResult.status }
      );
    }

    const body = await req.json();
    if (!body?.fileId) {
      return NextResponse.json(
        { success: false, message: 'fileId is required' },
        { status: 400 }
      );
    }

    const result = await doctorsService.addProfilePhoto(
      doctorId,
      body.fileId,
      body.isPrimary || false
    );
    return NextResponse.json(result, { status: result.success ? 201 : 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

async function ensureDoctorAccess(
  req: AuthenticatedRequest,
  doctorId: string,
  doctorsService: DoctorsService
) {
  const user = req.user;
  if (!user) {
    return { allowed: false, status: 401, message: 'Unauthorized' };
  }

  if (user.userRole === 'doctor') {
    const doctorResult = await doctorsService.findDoctorByUserId(user.userId);
    if (!doctorResult.success || !doctorResult.data) {
      return { allowed: false, status: 404, message: 'Doctor profile not found' };
    }

    if (doctorResult.data.id !== doctorId) {
      return { allowed: false, status: 403, message: 'Insufficient permissions' };
    }
  }

  return { allowed: true, status: 200 };
}

export const GET = withAuthAndContext(getHandler, ['doctor', 'admin']);
export const POST = withAuthAndContext(postHandler, ['doctor', 'admin']);

