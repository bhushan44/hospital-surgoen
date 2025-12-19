import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { getDb } from '@/lib/db';
import { orders, paymentTransactions, subscriptions, subscriptionPlans, planPricing } from '@/src/db/drizzle/migrations/schema';
import { eq, desc, and } from 'drizzle-orm';
import { SubscriptionsService } from '@/lib/services/subscriptions.service';

/**
 * Dummy Payment API Endpoint
 * Simulates payment processing for subscription upgrades
 * Always returns success for testing purposes
 * 
 * Now uses SubscriptionsService.create() to ensure features_at_purchase and plan_snapshot are stored
 */
async function postHandler(req: NextRequest) {
  try {
    const user = (req as any).user;
    const body = await req.json();
    const { planId, pricingId, amount, currency, billingCycle, paymentMethod, cardNumber, expiryDate, cvv, cardholderName, upiId, bankName, accountNumber } = body;

    if (!planId || !amount) {
      return NextResponse.json(
        { success: false, message: 'Plan ID and amount are required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Get plan details
    const [planData] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId))
      .limit(1);

    if (!planData) {
      return NextResponse.json(
        { success: false, message: 'Plan not found' },
        { status: 404 }
      );
    }

    // Get pricing details if pricingId is provided
    let pricingData = null;
    let billingPeriodMonths = 1;
    
    if (pricingId) {
      const [pricing] = await db
        .select()
        .from(planPricing)
        .where(
          and(
            eq(planPricing.id, pricingId),
            eq(planPricing.planId, planId)
          )
        )
        .limit(1);
      
      if (pricing) {
        pricingData = pricing;
        billingPeriodMonths = pricing.billingPeriodMonths;
      }
    } else {
      // If no pricingId, get default pricing for the plan
      const [defaultPricing] = await db
        .select()
        .from(planPricing)
        .where(
          and(
            eq(planPricing.planId, planId),
            eq(planPricing.isActive, true)
          )
        )
        .orderBy(planPricing.billingPeriodMonths)
        .limit(1);
      
      if (defaultPricing) {
        pricingData = defaultPricing;
        billingPeriodMonths = defaultPricing.billingPeriodMonths;
      }
    }

    // Validate amount matches pricing (if pricing exists)
    if (pricingData) {
      const pricingAmountInCents = Number(pricingData.price);
      const requestedAmountInCents = Math.round(amount * 100);

      if (pricingAmountInCents !== requestedAmountInCents) {
        return NextResponse.json(
          { success: false, message: 'Amount mismatch with plan pricing' },
          { status: 400 }
        );
      }
    }

    // Simulate payment processing delay (2-3 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Calculate dates based on billing period
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + billingPeriodMonths);

    // Get existing active subscription (for upgrade tracking)
    const [existingSubscription] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, user.userId),
          eq(subscriptions.status, 'active')
        )
      )
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    // Create order
    const [order] = await db
      .insert(orders)
      .values({
        userId: user.userId,
        orderType: 'subscription',
        planId: planId,
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency || pricingData?.currency || 'USD',
        description: `Subscription payment for ${planData.name}`,
        status: 'paid',
        paidAt: new Date().toISOString(),
      })
      .returning();

    // Create payment transaction (always success for dummy)
    const transactionId = `DUMMY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const paymentResult = await db
      .insert(paymentTransactions)
      .values({
        orderId: order.id,
        paymentGateway: 'dummy',
        paymentId: transactionId,
        paymentMethod: paymentMethod || 'card',
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency || pricingData?.currency || 'USD',
        status: 'success', // Always success for dummy payment
        gatewayResponse: {
          method: paymentMethod,
          dummy: true,
          processedAt: new Date().toISOString(),
        },
        verifiedAt: new Date().toISOString(),
      })
      .returning();
    
    const paymentTransaction = Array.isArray(paymentResult) ? paymentResult[0] : paymentResult;
    if (!paymentTransaction) {
      throw new Error('Failed to create payment transaction');
    }

    // If upgrading, cancel the old subscription first
    if (existingSubscription) {
      await db
        .update(subscriptions)
        .set({
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
          cancellationReason: 'Upgraded to new plan',
          cancelledBy: 'user',
        })
        .where(eq(subscriptions.id, existingSubscription.id));
    }

    // Create new subscription using SubscriptionsService (this will store features_at_purchase and plan_snapshot)
    const subscriptionsService = new SubscriptionsService();
    const subscriptionResult = await subscriptionsService.create({
      userId: user.userId,
      planId: planId,
      pricingId: pricingId || pricingData?.id,
      status: 'active',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      autoRenew: true,
      // Upgrade tracking fields
      previousSubscriptionId: existingSubscription?.id,
      upgradeFromPlanId: existingSubscription?.planId,
      upgradeFromPricingId: existingSubscription?.pricingId || undefined,
    });

    if (!subscriptionResult.success) {
      throw new Error(subscriptionResult.message || 'Failed to create subscription');
    }

    // Update the subscription with order and payment transaction IDs
    const newSubscription = subscriptionResult.data;
    if (newSubscription) {
      await db
        .update(subscriptions)
        .set({
          orderId: order.id,
          paymentTransactionId: paymentTransaction.id as string,
        })
        .where(eq(subscriptions.id, newSubscription.id));
    }

    return NextResponse.json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        paymentId: paymentTransaction.id,
        transactionId: transactionId,
        orderId: order.id,
        subscriptionId: newSubscription?.id,
        amount: amount,
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

