import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { paymentManager } from '@/app/api/lib/payment-gate-ways/payment-gateway-manager';
import { getDb } from '@/lib/db';
import { users, planPricing, subscriptionPlans, orders } from '@/src/db/drizzle/migrations/schema';
import { eq, and, sql, asc, count } from 'drizzle-orm';

async function postHandler(req: AuthenticatedRequest) {
  try {
    const { planId, pricingId, gateway } = await req.json();

    // Validate required fields
    if (!planId || !pricingId || !gateway) {
      return NextResponse.json(
        { success: false, message: 'planId, pricingId, and gateway are required' },
        { status: 400 }
      );
    }

    // Get user ID and role from JWT token
    const userId = req.user?.userId;
    const userRole = req.user?.userRole;
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

    const plan = planResult[0];

    // Fetch the specific pricing option selected by user
    const pricingResult = await getDb()
      .select()
      .from(planPricing)
      .where(
        and(
          eq(planPricing.id, pricingId),
          eq(planPricing.planId, planId),
          eq(planPricing.isActive, true),
          sql`(${planPricing.validUntil} IS NULL OR ${planPricing.validUntil} > NOW())`
        )
      )
      .limit(1);

    if (pricingResult.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Pricing option not found, inactive, or does not belong to this plan' },
        { status: 404 }
      );
    }

    const pricing = pricingResult[0];
    const amount = Number(pricing.price); // Price is in rupees from database
    const currency = pricing.currency || (gateway === 'razorpay' ? 'INR' : 'USD');

    // Set currency based on gateway if not set in pricing
    const finalCurrency = gateway === 'razorpay' && currency !== 'INR' ? 'INR' : 
                         gateway !== 'razorpay' && currency !== 'USD' ? 'USD' : 
                         currency;

    // ============================================
    // STEP 1: Calculate attempt number
    // ============================================
    const existingOrdersCount = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(
        and(
          eq(orders.userId, userId),
          eq(orders.planId, planId)
        )
      );

    const attemptNumber = (Number(existingOrdersCount[0]?.count) || 0) + 1;

    // ============================================
    // STEP 2: Create DB Order FIRST (BEFORE Razorpay)
    // ============================================
    const orderResult = await getDb()
      .insert(orders)
      .values({
        userId: userId,
        planId: planId,
        pricingId: pricing.id,
        orderType: 'subscription',
        amount: Math.round(amount), // Store in rupees (convert to paise only when sending to Razorpay)
        currency: finalCurrency,
        description: `Subscription payment for ${plan.name}`,
        status: 'pending',
        userRole: userRole || 'doctor',
        attemptNumber: attemptNumber,
      })
      .returning();

    const order = Array.isArray(orderResult) ? orderResult[0] : orderResult;
    if (!order) {
      throw new Error('Failed to create order');
    }

    // ============================================
    // STEP 3: Create Razorpay Order
    // ============================================
    const paymentGateway = paymentManager.getGateway(gateway);

    // Create checkout session with order ID in metadata
    const session = await paymentGateway.createCheckoutSession({
      amount: amount,
      currency: finalCurrency,
      planId: planId,
      successUrl: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/checkout/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/checkout`,
      metadata: {
        orderId: order.id, // Include DB order ID in metadata
        planId,
        userId,
        userRole: userRole || 'doctor',
        email: userEmail,
      },
    });

    // ============================================
    // STEP 4: Update DB Order with Razorpay Order ID
    // ============================================
    await getDb()
      .update(orders)
      .set({
        gatewayOrderId: session.id, // Razorpay order ID
        gatewayName: gateway,
      })
      .where(eq(orders.id, order.id));

    return NextResponse.json({
      success: true,
      data: { 
        session,
        orderId: order.id, // Return DB order ID for reference
        status: order.status, // Return order status (pending, paid, failed, expired, refunded)
      },
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(postHandler);

