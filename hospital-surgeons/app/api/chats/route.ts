import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { ChatService } from '@/lib/services/chat.service';
import { CreateConversationDtoSchema } from '@/lib/validations/chat.dto';

const chatService = new ChatService();

/**
 * GET /api/chats
 * List conversations for the authenticated user (doctor or hospital).
 */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { userId, userRole } = req.user!;
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const cursor = searchParams.get('cursor') || undefined;

    const result = await chatService.listConversations(userId, userRole, limit, cursor);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    const status = error.statusCode || 500;
    if (status < 500) return NextResponse.json({ success: false, message: error.message }, { status });
    console.error('GET /api/chats error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch conversations' }, { status: 500 });
  }
}, ['doctor', 'hospital']);

/**
 * POST /api/chats
 * Create or retrieve a conversation between a doctor and hospital.
 */
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const parsed = CreateConversationDtoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 });
    }

    const { doctorId, hospitalId } = parsed.data;
    const { userId, userRole } = req.user!;

    // Authorization: a doctor can only create conversations as themselves,
    // a hospital can only create conversations as themselves.
    if (userRole === 'doctor') {
      const { DoctorsRepository } = await import('@/lib/repositories/doctors.repository');
      const doctorsRepo = new DoctorsRepository();
      const doctor = await doctorsRepo.findDoctorByUserId(userId);
      if (!doctor || doctor.id !== doctorId) {
        return NextResponse.json({ success: false, message: 'Unauthorized: doctorId mismatch' }, { status: 403 });
      }
    } else if (userRole === 'hospital') {
      const { HospitalsRepository } = await import('@/lib/repositories/hospitals.repository');
      const hospitalsRepo = new HospitalsRepository();
      const hospital = await hospitalsRepo.findHospitalByUserId(userId);
      if (!hospital || hospital.id !== hospitalId) {
        return NextResponse.json({ success: false, message: 'Unauthorized: hospitalId mismatch' }, { status: 403 });
      }
    }

    const result = await chatService.getOrCreateConversation(doctorId, hospitalId);
    const statusCode = result.created ? 201 : 200;
    return NextResponse.json({ success: true, data: result.conversation }, { status: statusCode });
  } catch (error: any) {
    const status = error.statusCode || 500;
    if (status < 500) return NextResponse.json({ success: false, message: error.message }, { status });
    console.error('POST /api/chats error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create conversation' }, { status: 500 });
  }
}, ['doctor', 'hospital']);
