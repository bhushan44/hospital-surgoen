import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { subscriptions, users, subscriptionPlans, auditLogs } from '@/src/db/drizzle/migrations/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    const subscriptionId = id;

    const subscriptionResult = await db.execute(sql`
      SELECT 
        s.*,
        u.email as user_email,
        u.role as user_role,
        sp.name as plan_name,
        sp.tier as plan_tier,
        sp.user_role as plan_user_role,
        sp.price as plan_price,
        sp.currency as plan_currency
      FROM subscriptions s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE s.id = ${subscriptionId}
    `);

    if (subscriptionResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Subscription not found' },
        { status: 404 }
      );
    }

    const subscription = subscriptionResult.rows[0] as any;

    return NextResponse.json({
      success: true,
      data: {
        id: subscription.id,
        user: {
          id: subscription.user_id,
          email: subscription.user_email,
          role: subscription.user_role,
        },
        plan: {
          id: subscription.plan_id,
          name: subscription.plan_name,
          tier: subscription.plan_tier,
          userRole: subscription.plan_user_role,
          price: Number(subscription.plan_price) / 100,
          currency: subscription.plan_currency,
        },
        status: subscription.status,
        startDate: subscription.start_date,
        endDate: subscription.end_date,
        autoRenew: subscription.auto_renew,
        createdAt: subscription.created_at,
        updatedAt: subscription.updated_at,
      },
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch subscription',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    const subscriptionId = id;
    const body = await req.json();
    const { status, autoRenew, endDate } = body;

    // Check if subscription exists
    const existing = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subscriptionId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };
    if (status !== undefined) updateData.status = status;
    if (autoRenew !== undefined) updateData.autoRenew = autoRenew;
    if (endDate !== undefined) updateData.endDate = endDate;

    // Update subscription
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set(updateData)
      .where(eq(subscriptions.id, subscriptionId))
      .returning();

    // Create audit log
    await db.insert(auditLogs).values({
      actorType: 'admin',
      action: 'update',
      entityType: 'subscription',
      entityId: subscriptionId,
      details: {
        changes: updateData,
        previousStatus: existing[0].status,
        newStatus: status || existing[0].status,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription updated successfully',
      data: updatedSubscription,
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update subscription',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


