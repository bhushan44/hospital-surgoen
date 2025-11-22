import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { subscriptionPlans, subscriptions, doctorPlanFeatures, hospitalPlanFeatures } from '@/src/db/drizzle/migrations/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const planId = params.id;

    // Get plan with subscriber count
    const planResult = await db
      .select({
        id: subscriptionPlans.id,
        name: subscriptionPlans.name,
        tier: subscriptionPlans.tier,
        userRole: subscriptionPlans.userRole,
        price: subscriptionPlans.price,
        currency: subscriptionPlans.currency,
        subscriberCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM subscriptions 
          WHERE plan_id = ${planId}
          AND status = 'active'
        )`,
      })
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId))
      .limit(1);

    if (planResult.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Subscription plan not found' },
        { status: 404 }
      );
    }

    const plan = planResult[0];

    // Get plan features
    let features = null;
    if (plan.userRole === 'doctor') {
      const doctorFeatures = await db
        .select()
        .from(doctorPlanFeatures)
        .where(eq(doctorPlanFeatures.planId, planId))
        .limit(1);
      
      if (doctorFeatures.length > 0) {
        features = {
          visibilityWeight: doctorFeatures[0].visibilityWeight,
          maxAffiliations: doctorFeatures[0].maxAffiliations,
          notes: doctorFeatures[0].notes,
        };
      }
    } else if (plan.userRole === 'hospital') {
      const hospitalFeatures = await db
        .select()
        .from(hospitalPlanFeatures)
        .where(eq(hospitalPlanFeatures.planId, planId))
        .limit(1);
      
      if (hospitalFeatures.length > 0) {
        features = {
          maxPatientsPerMonth: hospitalFeatures[0].maxPatientsPerMonth,
          includesPremiumDoctors: hospitalFeatures[0].includesPremiumDoctors,
          notes: hospitalFeatures[0].notes,
        };
      }
    }

    const priceInCents = Number(plan.price);
    const priceInDollars = priceInCents / 100;
    
    return NextResponse.json({
      success: true,
      data: {
        id: plan.id,
        name: plan.name,
        tier: plan.tier,
        userRole: plan.userRole,
        price: priceInCents,
        currency: plan.currency,
        priceFormatted: `${plan.currency} ${priceInDollars.toFixed(2)}`,
        subscribers: plan.subscriberCount || 0,
        features,
      },
    });
  } catch (error) {
    console.error('Error fetching subscription plan:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch subscription plan',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const planId = params.id;
    const body = await req.json();
    const { name, tier, price, currency } = body;

    // Check if plan exists
    const existing = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Subscription plan not found' },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (tier !== undefined) {
      const validTiers = ['free', 'basic', 'premium', 'enterprise'];
      if (!validTiers.includes(tier)) {
        return NextResponse.json(
          { success: false, message: `Tier must be one of: ${validTiers.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.tier = tier;
    }
    if (price !== undefined) updateData.price = BigInt(Math.round(price * 100));
    if (currency !== undefined) updateData.currency = currency;

    // Check for duplicate name if name is being updated
    if (name && name.trim() !== existing[0].name) {
      const duplicate = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.name, name.trim()))
        .limit(1);

      if (duplicate.length > 0) {
        return NextResponse.json(
          { success: false, message: 'Plan with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Update plan
    const [updatedPlan] = await db
      .update(subscriptionPlans)
      .set(updateData)
      .where(eq(subscriptionPlans.id, planId))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Subscription plan updated successfully',
      data: {
        id: updatedPlan.id,
        name: updatedPlan.name,
        tier: updatedPlan.tier,
        userRole: updatedPlan.userRole,
        price: Number(updatedPlan.price),
        currency: updatedPlan.currency,
        priceFormatted: `${updatedPlan.currency} ${(Number(updatedPlan.price) / 100).toFixed(2)}`,
      },
    });
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update subscription plan',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const planId = params.id;

    // Check if plan exists
    const existing = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Subscription plan not found' },
        { status: 404 }
      );
    }

    // Check if plan has active subscriptions
    const activeSubscriptions = await db
      .select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(eq(subscriptions.planId, planId));

    const subscriptionCount = Number(activeSubscriptions[0]?.count || 0);

    if (subscriptionCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete plan. It has ${subscriptionCount} active subscription(s).`,
          data: {
            subscriptionCount,
          },
        },
        { status: 409 }
      );
    }

    // Delete plan features first
    if (existing[0].userRole === 'doctor') {
      await db
        .delete(doctorPlanFeatures)
        .where(eq(doctorPlanFeatures.planId, planId));
    } else {
      await db
        .delete(hospitalPlanFeatures)
        .where(eq(hospitalPlanFeatures.planId, planId));
    }

    // Delete plan
    await db
      .delete(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId));

    return NextResponse.json({
      success: true,
      message: 'Subscription plan deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete subscription plan',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

