import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionsService } from '@/lib/services/subscriptions.service';
import { withAuth } from '@/lib/auth/middleware';

async function getHandler(req: NextRequest) {
  try {
    const subscriptionsService = new SubscriptionsService();
    const result = await subscriptionsService.listPlans();
    
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

async function postHandler(req: NextRequest) {
  try {
    const body = await req.json();
    const subscriptionsService = new SubscriptionsService();
    const result = await subscriptionsService.createPlan(body);
    
    return NextResponse.json(result, { status: result.success ? 201 : 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

export const GET = getHandler;
export const POST = withAuth(postHandler, ['admin']);









