import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { subscriptionPlans, subscriptions, doctorPlanFeatures, hospitalPlanFeatures } from '@/src/db/drizzle/migrations/schema';
import { eq, sql, and, ne, count } from 'drizzle-orm';
import { validateRequest } from '@/lib/utils/validate-request';
import { UpdatePlanDtoSchema } from '@/lib/validations/plan.dto';
import { createAuditLog, getRequestMetadata, buildChangesObject } from '@/lib/utils/audit-logger';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    const planId = id;

    // Get plan
    const planResult = await db
      .select({
        id: subscriptionPlans.id,
        name: subscriptionPlans.name,
        tier: subscriptionPlans.tier,
        userRole: subscriptionPlans.userRole,
        price: subscriptionPlans.price,
        currency: subscriptionPlans.currency,
      })
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId))
      .limit(1);

    // Get subscriber count separately
    const subscriberCountResult = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.planId, planId),
          eq(subscriptions.status, 'active')
        )
      );

    const subscriberCount = subscriberCountResult[0]?.count || 0;

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
        subscribers: Number(subscriberCount),
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    const planId = id;
    
    // Validate request body with Zod schema
    const validation = await validateRequest(req, UpdatePlanDtoSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { name, tier, price, currency, features } = validation.data;

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

    const planData = existing[0];
    const userRole = planData.userRole;

    // Build update object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (tier !== undefined) updateData.tier = tier;
    if (price !== undefined) updateData.price = BigInt(Math.round(price * 100));
    if (currency !== undefined) updateData.currency = currency;

    // Check for duplicate name if name is being updated
    if (name && name.trim() !== existing[0].name) {
      const duplicateByName = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.name, name.trim()))
        .limit(1);

      if (duplicateByName.length > 0) {
        return NextResponse.json(
          { success: false, message: 'Plan with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Check for duplicate tier if tier is being updated (same tier for same userRole)
    if (tier && tier !== existing[0].tier) {
      const duplicateByTier = await db
        .select()
        .from(subscriptionPlans)
        .where(
          and(
            eq(subscriptionPlans.tier, tier),
            eq(subscriptionPlans.userRole, userRole),
            ne(subscriptionPlans.id, planId)
          )
        )
        .limit(1);

      if (duplicateByTier.length > 0) {
        return NextResponse.json(
          { success: false, message: `A ${tier} plan already exists for ${userRole}s` },
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

    // Update or create features if provided
    if (features) {
      if (userRole === 'doctor') {
        const doctorFeatures = features as { visibilityWeight?: number; maxAffiliations?: number; notes?: string };
        const { visibilityWeight, maxAffiliations, notes } = doctorFeatures;

        const existingFeatures = await db
          .select()
          .from(doctorPlanFeatures)
          .where(eq(doctorPlanFeatures.planId, planId))
          .limit(1);

        if (existingFeatures.length > 0) {
          // Update existing
          await db
            .update(doctorPlanFeatures)
            .set({
              visibilityWeight: visibilityWeight !== undefined ? visibilityWeight : existingFeatures[0].visibilityWeight,
              maxAffiliations: maxAffiliations !== undefined ? maxAffiliations : existingFeatures[0].maxAffiliations,
              notes: notes !== undefined ? notes : existingFeatures[0].notes,
            })
            .where(eq(doctorPlanFeatures.planId, planId));
        } else {
          // Create new
          await db
            .insert(doctorPlanFeatures)
            .values({
              planId: planId,
              visibilityWeight: visibilityWeight !== undefined ? visibilityWeight : 1,
              maxAffiliations: maxAffiliations !== undefined ? maxAffiliations : 1,
              notes: notes || null,
            });
        }
      } else if (userRole === 'hospital') {
        const hospitalFeatures = features as { maxPatientsPerMonth?: number; maxAssignmentsPerMonth?: number; includesPremiumDoctors?: boolean; notes?: string };
        const { maxPatientsPerMonth, maxAssignmentsPerMonth, includesPremiumDoctors, notes } = hospitalFeatures;

        const existingFeatures = await db
          .select()
          .from(hospitalPlanFeatures)
          .where(eq(hospitalPlanFeatures.planId, planId))
          .limit(1);

        if (existingFeatures.length > 0) {
          // Update existing
          await db
            .update(hospitalPlanFeatures)
            .set({
              maxPatientsPerMonth: maxPatientsPerMonth !== undefined ? maxPatientsPerMonth : existingFeatures[0].maxPatientsPerMonth,
              maxAssignmentsPerMonth: maxAssignmentsPerMonth !== undefined ? maxAssignmentsPerMonth : existingFeatures[0].maxAssignmentsPerMonth,
              includesPremiumDoctors: includesPremiumDoctors !== undefined ? includesPremiumDoctors : existingFeatures[0].includesPremiumDoctors,
              notes: notes !== undefined ? notes : existingFeatures[0].notes,
            })
            .where(eq(hospitalPlanFeatures.planId, planId));
        } else {
          // Create new
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
    }

    // Get request metadata
    const metadata = getRequestMetadata(req);
    const adminUserId = req.headers.get('x-user-id') || null;

    // Build changes object
    const oldData: any = {
      name: planData.name,
      tier: planData.tier,
      price: Number(planData.price),
      currency: planData.currency,
    };
    const newData: any = {
      name: updatedPlan.name,
      tier: updatedPlan.tier,
      price: Number(updatedPlan.price),
      currency: updatedPlan.currency,
    };
    const changes = buildChangesObject(oldData, newData, ['name', 'tier', 'price', 'currency']);

    // Create comprehensive audit log
    await createAuditLog({
      userId: adminUserId,
      actorType: 'admin',
      action: 'update',
      entityType: 'subscription_plan',
      entityId: planId,
      entityName: updatedPlan.name,
      httpMethod: 'PUT',
      endpoint: `/api/admin/plans/${planId}`,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      changes: changes,
      details: {
        userRole: updatedPlan.userRole,
        featuresUpdated: !!features,
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
      message: features ? 'Subscription plan and features updated successfully' : 'Subscription plan updated successfully',
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    const planId = id;

    // Step 1: Check if plan exists
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

    // Step 2: Check if plan has any active subscriptions before deletion
    const activeSubscriptions = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.planId, planId),
          eq(subscriptions.status, 'active')
        )
      );

    const activeSubscriptionCount = Number(activeSubscriptions[0]?.count || 0);

    // Step 3: Prevent deletion if there are active subscriptions
    if (activeSubscriptionCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete plan. It has ${activeSubscriptionCount} active subscription(s).`,
          data: {
            subscriptionCount: activeSubscriptionCount,
          },
        },
        { status: 409 }
      );
    }

    // Step 4: Safe to delete - delete plan features first (cascade)
    if (existing[0].userRole === 'doctor') {
      await db
        .delete(doctorPlanFeatures)
        .where(eq(doctorPlanFeatures.planId, planId));
    } else {
      await db
        .delete(hospitalPlanFeatures)
        .where(eq(hospitalPlanFeatures.planId, planId));
    }

    // Step 5: Delete the plan
    await db
      .delete(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId));

    // Get request metadata
    const metadata = getRequestMetadata(req);
    const adminUserId = req.headers.get('x-user-id') || null;

    // Create comprehensive audit log
    await createAuditLog({
      userId: adminUserId,
      actorType: 'admin',
      action: 'delete',
      entityType: 'subscription_plan',
      entityId: planId,
      entityName: existing[0].name,
      httpMethod: 'DELETE',
      endpoint: `/api/admin/plans/${planId}`,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      details: {
        tier: existing[0].tier,
        userRole: existing[0].userRole,
        price: Number(existing[0].price),
        currency: existing[0].currency,
        activeSubscriptionsAtDeletion: activeSubscriptionCount,
        deletedAt: new Date().toISOString(),
      },
    });

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

