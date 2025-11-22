import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { subscriptionPlans, subscriptions, doctorPlanFeatures, hospitalPlanFeatures } from '@/src/db/drizzle/migrations/schema';
import { eq, sql, desc, asc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const searchParams = req.nextUrl.searchParams;
    
    // Filters
    const userRole = searchParams.get('userRole') || undefined;
    const tier = searchParams.get('tier') || undefined;

    // Build where conditions
    const conditions = [];
    
    if (userRole && userRole !== 'all') {
      conditions.push(eq(subscriptionPlans.userRole, userRole));
    }
    
    if (tier && tier !== 'all') {
      conditions.push(eq(subscriptionPlans.tier, tier));
    }

    // Get all plans with subscriber counts
    const plansList = await db
      .select({
        id: subscriptionPlans.id,
        name: subscriptionPlans.name,
        tier: subscriptionPlans.tier,
        userRole: subscriptionPlans.userRole,
        price: subscriptionPlans.price,
        currency: subscriptionPlans.currency,
        // Count active subscribers
        subscriberCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM subscriptions 
          WHERE plan_id = ${subscriptionPlans.id}
          AND status = 'active'
        )`,
      })
      .from(subscriptionPlans)
      .where(conditions.length > 0 ? conditions[0] : undefined)
      .orderBy(asc(subscriptionPlans.userRole), asc(subscriptionPlans.tier));

    // Format response
    const formattedPlans = plansList.map((plan) => {
      const priceInCents = Number(plan.price);
      const priceInDollars = priceInCents / 100;
      return {
        id: plan.id,
        name: plan.name,
        tier: plan.tier,
        userRole: plan.userRole,
        price: priceInCents,
        currency: plan.currency,
        priceFormatted: `${plan.currency} ${priceInDollars.toFixed(2)}`,
        subscribers: plan.subscriberCount || 0,
      };
    });

    // Group by user role
    const doctorPlans = formattedPlans.filter(p => p.userRole === 'doctor');
    const hospitalPlans = formattedPlans.filter(p => p.userRole === 'hospital');

    return NextResponse.json({
      success: true,
      data: formattedPlans,
      grouped: {
        doctors: doctorPlans,
        hospitals: hospitalPlans,
      },
    });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch subscription plans',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const { name, tier, userRole, price, currency = 'USD' } = body;

    if (!name || !tier || !userRole || price === undefined) {
      return NextResponse.json(
        { success: false, message: 'Name, tier, userRole, and price are required' },
        { status: 400 }
      );
    }

    // Validate tier
    const validTiers = ['free', 'basic', 'premium', 'enterprise'];
    if (!validTiers.includes(tier)) {
      return NextResponse.json(
        { success: false, message: `Tier must be one of: ${validTiers.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate userRole
    const validRoles = ['doctor', 'hospital'];
    if (!validRoles.includes(userRole)) {
      return NextResponse.json(
        { success: false, message: `User role must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if plan with same name already exists
    const existing = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.name, name.trim()))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Plan with this name already exists' },
        { status: 409 }
      );
    }

    // Create new plan
    const [newPlan] = await db
      .insert(subscriptionPlans)
      .values({
        name: name.trim(),
        tier: tier,
        userRole: userRole,
        price: BigInt(Math.round(price * 100)), // Convert to cents
        currency: currency,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Subscription plan created successfully',
      data: {
        id: newPlan.id,
        name: newPlan.name,
        tier: newPlan.tier,
        userRole: newPlan.userRole,
        price: Number(newPlan.price),
        currency: newPlan.currency,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create subscription plan',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

