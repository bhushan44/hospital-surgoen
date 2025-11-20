import { NextRequest, NextResponse } from 'next/server';
import { NotificationsService } from '@/lib/services/notifications.service';
import { withAuth } from '@/lib/auth/middleware';

async function getHandler(req: NextRequest) {
  try {
    const user = (req as any).user;
    const notificationsService = new NotificationsService();
    const result = await notificationsService.getPreferences(user.userId);
    
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

async function patchHandler(req: NextRequest) {
  try {
    const user = (req as any).user;
    const body = await req.json();
    const notificationsService = new NotificationsService();
    const result = await notificationsService.upsertPreferences(user.userId, body);
    
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);
export const PATCH = withAuth(patchHandler);







