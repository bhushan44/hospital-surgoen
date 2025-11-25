import { NextRequest, NextResponse } from 'next/server';
import { HospitalsService } from '@/lib/services/hospitals.service';
import { withAuthAndContext, AuthenticatedRequest } from '@/lib/auth/middleware';

const ALLOWED_DOCUMENT_TYPES = ['license', 'accreditation', 'insurance', 'other'];

async function getHandler(req: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const hospitalsService = new HospitalsService();

    // Ensure the user has access to this hospital
    const authorizationResult = await ensureHospitalAccess(req, params.id, hospitalsService);
    if (!authorizationResult.allowed) {
      return NextResponse.json(
        { success: false, message: authorizationResult.message },
        { status: authorizationResult.status }
      );
    }

    const result = await hospitalsService.getHospitalDocuments(params.id);
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
    const hospitalsService = new HospitalsService();

    // Ensure the user has access to this hospital
    const authorizationResult = await ensureHospitalAccess(req, params.id, hospitalsService);
    if (!authorizationResult.allowed) {
      return NextResponse.json(
        { success: false, message: authorizationResult.message },
        { status: authorizationResult.status }
      );
    }

    const body = await req.json();
    if (!body?.fileId || !body?.documentType) {
      return NextResponse.json(
        { success: false, message: 'fileId and documentType are required' },
        { status: 400 }
      );
    }

    if (!ALLOWED_DOCUMENT_TYPES.includes(body.documentType)) {
      return NextResponse.json(
        { success: false, message: `Invalid document type. Must be one of: ${ALLOWED_DOCUMENT_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const payload = {
      fileId: body.fileId,
      documentType: body.documentType,
    };

    const result = await hospitalsService.addDocument(params.id, payload);
    return NextResponse.json(result, { status: result.success ? 201 : 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

async function ensureHospitalAccess(
  req: AuthenticatedRequest,
  hospitalId: string,
  hospitalsService: HospitalsService
): Promise<{ allowed: boolean; message?: string; status?: number }> {
  const user = req.user;
  if (!user) {
    return { allowed: false, message: 'Unauthorized', status: 401 };
  }

  // Admin can access any hospital
  if (user.userRole === 'admin') {
    return { allowed: true };
  }

  // Hospital users can only access their own hospital
  if (user.userRole === 'hospital') {
    const hospitalResult = await hospitalsService.findHospitalByUserId(user.userId);
    if (!hospitalResult.success || !hospitalResult.data) {
      return { allowed: false, message: 'Hospital profile not found', status: 404 };
    }

    if (hospitalResult.data.id !== hospitalId) {
      return { allowed: false, message: 'You do not have permission to access this hospital', status: 403 };
    }

    return { allowed: true };
  }

  return { allowed: false, message: 'You do not have permission to access hospital documents', status: 403 };
}

export const GET = withAuthAndContext(getHandler, ['hospital', 'admin']);
export const POST = withAuthAndContext(postHandler, ['hospital', 'admin']);

