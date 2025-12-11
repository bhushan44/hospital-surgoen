import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { subscriptionPlans, subscriptions, doctorPlanFeatures, hospitalPlanFeatures } from '@/src/db/drizzle/migrations/schema';
import { eq, sql, desc, asc, and, count } from 'drizzle-orm';
import { validateRequest } from '@/lib/utils/validate-request';
import { CreatePlanDtoSchema } from '@/lib/validations/plan.dto';
import { createAuditLog, getRequestMetadata } from '@/lib/utils/audit-logger';

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

    // Get all plans
    const plansList = await db
      .select({
        id: subscriptionPlans.id,
        name: subscriptionPlans.name,
        tier: subscriptionPlans.tier,
        userRole: subscriptionPlans.userRole,
        price: subscriptionPlans.price,
        currency: subscriptionPlans.currency,
      })
      .from(subscriptionPlans)
      .where(conditions.length > 0 ? conditions[0] : undefined)
      .orderBy(asc(subscriptionPlans.userRole), asc(subscriptionPlans.tier));

    // Get subscriber counts for all plans using aggregation
    const planIds = plansList.map(p => p.id);
    const countMap = new Map<string, number>();
    
    if (planIds.length > 0) {
      // Query subscriber counts grouped by planId
      const subscriberCounts = await db
        .select({
          planId: subscriptions.planId,
          count: sql<number>`COUNT(*)::int`.as('count'),
        })
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.status, 'active'),
            sql`${subscriptions.planId} IN (${sql.join(planIds.map(id => sql`${id}`), sql`, `)})`
          )
        )
        .groupBy(subscriptions.planId);

      // Create a map of planId -> subscriber count
      subscriberCounts.forEach(sc => {
        countMap.set(sc.planId, Number(sc.count));
      });
    }

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
        subscribers: countMap.get(plan.id) || 0,
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
    
    // Validate request body with Zod schema
    const validation = await validateRequest(req, CreatePlanDtoSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { name, tier, userRole, price, currency = 'USD', features } = validation.data;

    // Check for duplicate: same name should not exist
    const existingByName = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.name, name.trim()))
      .limit(1);

    if (existingByName.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Plan with this name already exists' },
        { status: 409 }
      );
    }

    // Check for duplicate: same tier for same userRole should not exist
    const existingByTier = await db
      .select()
      .from(subscriptionPlans)
      .where(
        and(
          eq(subscriptionPlans.tier, tier),
          eq(subscriptionPlans.userRole, userRole)
        )
      )
      .limit(1);

    if (existingByTier.length > 0) {
      return NextResponse.json(
        { success: false, message: `A ${tier} plan already exists for ${userRole}s` },
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
        price: Math.round(price * 100), // Convert to cents (bigint with mode: "number" accepts number)
        currency: currency,
      })
      .returning();

    const planId = newPlan.id;

    // Save features if provided
    if (features) {
      if (userRole === 'doctor') {
        const doctorFeatures = features as { visibilityWeight?: number; maxAffiliations?: number; notes?: string };
        const { visibilityWeight, maxAffiliations, notes } = doctorFeatures;
        await db
          .insert(doctorPlanFeatures)
          .values({
            planId: planId,
            visibilityWeight: visibilityWeight !== undefined ? visibilityWeight : 1,
            maxAffiliations: maxAffiliations !== undefined ? maxAffiliations : 1,
            notes: notes || null,
          });
      } else if (userRole === 'hospital') {
        const hospitalFeatures = features as { maxPatientsPerMonth?: number; maxAssignmentsPerMonth?: number; includesPremiumDoctors?: boolean; notes?: string };
        const { maxPatientsPerMonth, maxAssignmentsPerMonth, includesPremiumDoctors, notes } = hospitalFeatures;
        await db
          .insert(hospitalPlanFeatures)
          .values({
            planId: planId,
            maxPatientsPerMonth: maxPatientsPerMonth !== undefined && maxPatientsPerMonth !== null ? maxPatientsPerMonth : null,
            maxAssignmentsPerMonth: maxAssignmentsPerMonth !== undefined && maxAssignmentsPerMonth !== null ? maxAssignmentsPerMonth : null,
            includesPremiumDoctors: includesPremiumDoctors !== undefined ? includesPremiumDoctors : false,
            notes: notes || null,
          });
      }
    }

    // Get request metadata
    const metadata = getRequestMetadata(req);
    const adminUserId = req.headers.get('x-user-id') || null;

    // Create comprehensive audit log
    await createAuditLog({
      userId: adminUserId,
      actorType: 'admin',
      action: 'create',
      entityType: 'subscription_plan',
      entityId: planId,
      entityName: newPlan.name,
      httpMethod: 'POST',
      endpoint: '/api/admin/plans',
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      details: {
        tier: newPlan.tier,
        userRole: newPlan.userRole,
        price: Number(newPlan.price),
        currency: newPlan.currency,
        hasFeatures: !!features,
        features: features ? (userRole === 'doctor' 
          ? {
              visibilityWeight: (features as any).visibilityWeight,
              maxAffiliations: (features as any).maxAffiliations,
            }
          : {
              maxPatientsPerMonth: (features as any).maxPatientsPerMonth,
              maxAssignmentsPerMonth: (features as any).maxAssignmentsPerMonth,
              includesPremiumDoctors: (features as any).includesPremiumDoctors,
            }) : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: features ? 'Subscription plan and features created successfully' : 'Subscription plan created successfully',
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

