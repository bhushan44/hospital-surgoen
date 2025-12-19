import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { paymentManager } from '@/app/api/lib/payment-gate-ways/payment-gateway-manager';
import { getDb } from '@/lib/db';
import { users, planPricing, subscriptionPlans } from '@/src/db/drizzle/migrations/schema';
import { eq, and, sql, asc } from 'drizzle-orm';

async function postHandler(req: AuthenticatedRequest) {
  try {
    const { planId, gateway } = await req.json();

    // Validate required fields
    if (!planId || !gateway) {
      return NextResponse.json(
        { success: false, message: 'planId and gateway are required' },
        { status: 400 }
      );
    }

    // Get user ID from JWT token
    const userId = req.user?.userId;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Fetch user email from database
    const userResult = await getDb()
      .select({
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const userEmail = userResult[0].email;

    // Verify plan exists
    const planResult = await getDb()
      .select()
      .from(subscriptionPlans)
      .where(
        and(
          eq(subscriptionPlans.id, planId),
          eq(subscriptionPlans.isActive, true)
        )
      )
      .limit(1);

    if (planResult.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Plan not found or inactive' },
        { status: 404 }
      );
    }

    // Fetch plan pricing from database
    // Get the first active pricing option (preferably monthly, but any active pricing)
    const pricingResult = await getDb()
      .select()
      .from(planPricing)
      .where(
        and(
          eq(planPricing.planId, planId),
          eq(planPricing.isActive, true),
          sql`(${planPricing.validUntil} IS NULL OR ${planPricing.validUntil} > NOW())`
        )
      )
      .orderBy(asc(planPricing.billingPeriodMonths))
      .limit(1);

    if (pricingResult.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No active pricing found for this plan' },
        { status: 404 }
      );
    }

    const pricing = pricingResult[0];
    const amount = Number(pricing.price);
    const currency = pricing.currency || (gateway === 'razorpay' ? 'INR' : 'USD');

    // Get payment gateway
    const paymentGateway = paymentManager.getGateway(gateway);

    // Set currency based on gateway if not set in pricing
    const finalCurrency = gateway === 'razorpay' && currency !== 'INR' ? 'INR' : 
                         gateway !== 'razorpay' && currency !== 'USD' ? 'USD' : 
                         currency;

    // Create checkout session
    const session = await paymentGateway.createCheckoutSession({
      amount: amount,
      currency: finalCurrency,
      planId: planId,
      successUrl: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/checkout/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/checkout`,
      metadata: {
        planId,
        userId,
        email: userEmail,
      },
    });

    return NextResponse.json({
      success: true,
      data: { session },
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(postHandler);