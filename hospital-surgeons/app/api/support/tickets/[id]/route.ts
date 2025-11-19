import { NextRequest, NextResponse } from 'next/server';
import { SupportService } from '@/lib/services/support.service';
import { withAuthAndContext, AuthenticatedRequest } from '@/lib/auth/middleware';

async function getHandler(req: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const supportService = new SupportService();
    const result = await supportService.getTicket(params.id);
    
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
    const supportService = new SupportService();
    const result = await supportService.updateTicket(params.id, body);
    
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

async function deleteHandler(req: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const supportService = new SupportService();
    const result = await supportService.deleteTicket(params.id);
    
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

export const GET = withAuthAndContext(getHandler);
export const PATCH = withAuthAndContext(patchHandler, ['admin']);
export const DELETE = withAuthAndContext(deleteHandler, ['admin']);
