import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { getDb } from '@/lib/db';
import { orders, paymentTransactions, subscriptions, subscriptionPlans, users } from '@/src/db/drizzle/migrations/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * Dummy Payment API Endpoint
 * Simulates payment processing for subscription upgrades
 * Always returns success for testing purposes
 */
async function postHandler(req: NextRequest) {
  try {
    const user = (req as any).user;
    const body = await req.json();
    const { planId, amount, paymentMethod, cardNumber, expiryDate, cvv, cardholderName, upiId, bankName, accountNumber } = body;

    if (!planId || !amount) {
      return NextResponse.json(
        { success: false, message: 'Plan ID and amount are required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Get plan details
    const plan = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId))
      .limit(1);

    if (plan.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Plan not found' },
        { status: 404 }
      );
    }

    const planData = plan[0];

    // Validate amount matches plan price
    const planPriceInCents = Number(planData.price);
    const requestedAmountInCents = Math.round(amount * 100);

    if (planPriceInCents !== requestedAmountInCents) {
      return NextResponse.json(
        { success: false, message: 'Amount mismatch with plan price' },
        { status: 400 }
      );
    }

    // Simulate payment processing delay (2-3 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create order
    const [order] = await db
      .insert(orders)
      .values({
        userId: user.userId,
        orderType: 'subscription',
        planId: planId,
        amount: Number(planPriceInCents),
        currency: 'USD',
        description: `Subscription payment for ${planData.name}`,
        status: 'paid',
        paidAt: new Date().toISOString(),
      })
      .returning();

    // Create payment transaction (always success for dummy)
    const transactionId = `DUMMY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const [paymentTransaction] = await db
      .insert(paymentTransactions)
      .values({
        orderId: order.id,
        paymentGateway: 'dummy',
        paymentId: transactionId,
        paymentMethod: paymentMethod || 'card',
        amount: Number(planPriceInCents),
        currency: 'USD',
        status: 'success', // Always success for dummy payment
        gatewayResponse: {
          method: paymentMethod,
          dummy: true,
          processedAt: new Date().toISOString(),
        },
        verifiedAt: new Date().toISOString(),
      })
      .returning();

    // Get or create subscription
    const existingSubscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, user.userId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

    if (existingSubscription.length > 0) {
      // Update existing subscription
      await db
        .update(subscriptions)
        .set({
          planId: planId,
          status: 'active',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          autoRenew: true,
          orderId: order.id,
          paymentTransactionId: paymentTransaction.id,
        })
        .where(eq(subscriptions.id, existingSubscription[0].id));
    } else {
      // Create new subscription
      await db
        .insert(subscriptions)
        .values({
          userId: user.userId,
          planId: planId,
          status: 'active',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          autoRenew: true,
          orderId: order.id,
          paymentTransactionId: paymentTransaction.id,
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        paymentId: paymentTransaction.id,
        transactionId: transactionId,
        orderId: order.id,
        amount: planPriceInCents / 100,
        planName: planData.name,
        status: 'success',
      },
    });
  } catch (error) {
    console.error('Dummy payment error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Payment processing failed',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export const POST = withAuth(postHandler);

