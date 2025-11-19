import { NextRequest, NextResponse } from 'next/server';
import { SupportService } from '@/lib/services/support.service';
import { withAuthAndContext, AuthenticatedRequest } from '@/lib/auth/middleware';

async function getHandler(req: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const supportService = new SupportService();
    const result = await supportService.listMessages(params.id);
    
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
    const user = (req as any).user;
    const body = await req.json();
    const supportService = new SupportService();
    const result = await supportService.addMessage({
      ticketId: params.id,
      userId: user.userId,
      message: body.message,
      isInternal: body.isInternal,
    });
    
    return NextResponse.json(result, { status: result.success ? 201 : 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

export const GET = withAuthAndContext(getHandler);
export const POST = withAuthAndContext(postHandler);

