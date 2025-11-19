import { NextRequest, NextResponse } from 'next/server';
import { NotificationsService } from '@/lib/services/notifications.service';
import { withAuthAndContext, AuthenticatedRequest } from '@/lib/auth/middleware';

async function getHandler(req: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const notificationsService = new NotificationsService();
    const result = await notificationsService.get(params.id);
    
    return NextResponse.json(result, { status: result.success ? 200 : 404 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

async function patchHandler(req: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const body = await req.json();
    const notificationsService = new NotificationsService();
    
    let result;
    if (body.isRead === true) {
      result = await notificationsService.markRead(params.id);
    } else if (body.isRead === false) {
      result = await notificationsService.markUnread(params.id);
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

export const GET = withAuthAndContext(getHandler);
export const PATCH = withAuthAndContext(patchHandler);
