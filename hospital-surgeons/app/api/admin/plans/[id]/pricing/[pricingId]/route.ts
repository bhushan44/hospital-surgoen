import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { subscriptionPlans, planPricing } from '@/src/db/drizzle/migrations/schema';
import { eq, and } from 'drizzle-orm';
import { validateRequest } from '@/lib/utils/validate-request';
import { UpdatePlanPricingDtoSchema } from '@/lib/validations/plan.dto';
import { createAuditLog, getRequestMetadata, buildChangesObject } from '@/lib/utils/audit-logger';

// PUT - Update pricing option
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; pricingId: string }> }
) {
  try {
    const db = getDb();
    const { id, pricingId } = await params;
    const planId = id;

    // Validate request body
    const validation = await validateRequest(req, UpdatePlanPricingDtoSchema);
    if (!validation.success) {
      return validation.response;
    }

    const updateData = validation.data;

    // Check if pricing exists
    const existing = await db
      .select()
      .from(planPricing)
      .where(
        and(
          eq(planPricing.id, pricingId),
          eq(planPricing.planId, planId)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Pricing option not found' },
        { status: 404 }
      );
    }

    // Build update object
    const updateValues: any = {};
    if (updateData.price !== undefined) updateValues.price = Math.round(updateData.price * 100); // bigint with mode: "number" accepts number
    if (updateData.currency !== undefined) updateValues.currency = updateData.currency;
    if (updateData.setupFee !== undefined) updateValues.setupFee = Math.round(updateData.setupFee * 100); // Convert to cents
    if (updateData.discountPercentage !== undefined) updateValues.discountPercentage = updateData.discountPercentage.toString(); // numeric type needs string
    if (updateData.isActive !== undefined) updateValues.isActive = updateData.isActive;
    if (updateData.validFrom !== undefined) updateValues.validFrom = new Date(updateData.validFrom).toISOString();
    if (updateData.validUntil !== undefined) updateValues.validUntil = updateData.validUntil ? new Date(updateData.validUntil).toISOString() : null;
    if (updateData.billingPeriodMonths !== undefined) updateValues.billingPeriodMonths = updateData.billingPeriodMonths;
    updateValues.updatedAt = new Date().toISOString();

    // Update pricing
    const [updatedPricing] = await db
      .update(planPricing)
      .set(updateValues)
      .where(eq(planPricing.id, pricingId))
      .returning();

    // Get plan info
    const plan = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId))
      .limit(1);

    // Get request metadata
    const metadata = getRequestMetadata(req);
    const adminUserId = req.headers.get('x-user-id') || null;

    // Build changes object
    const oldData: any = {
      price: Number(existing[0].price),
      currency: existing[0].currency,
      discountPercentage: Number(existing[0].discountPercentage),
      isActive: existing[0].isActive,
    };
    const newData: any = {
      price: Number(updatedPricing.price),
      currency: updatedPricing.currency,
      discountPercentage: Number(updatedPricing.discountPercentage),
      isActive: updatedPricing.isActive,
    };
    const changes = buildChangesObject(oldData, newData, ['price', 'currency', 'discountPercentage', 'isActive']);

    // Create audit log
    await createAuditLog({
      userId: adminUserId,
      actorType: 'admin',
      action: 'update',
      entityType: 'plan_pricing',
      entityId: pricingId,
      entityName: `${plan[0]?.name || 'Plan'} - ${updatedPricing.billingCycle}`,
      httpMethod: 'PUT',
      endpoint: `/api/admin/plans/${planId}/pricing/${pricingId}`,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      changes: changes,
    });

    return NextResponse.json({
      success: true,
      message: 'Pricing option updated successfully',
      data: {
        id: updatedPricing.id,
        billingCycle: updatedPricing.billingCycle,
        billingPeriodMonths: updatedPricing.billingPeriodMonths,
        price: Number(updatedPricing.price),
        currency: updatedPricing.currency,
      },
    });
  } catch (error) {
    console.error('Error updating plan pricing:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update plan pricing',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete pricing option
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; pricingId: string }> }
) {
  try {
    const db = getDb();
    const { id, pricingId } = await params;
    const planId = id;

    // Check if pricing exists
    const existing = await db
      .select()
      .from(planPricing)
      .where(
        and(
          eq(planPricing.id, pricingId),
          eq(planPricing.planId, planId)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Pricing option not found' },
        { status: 404 }
      );
    }

    // Get plan info
    const plan = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId))
      .limit(1);

    // Delete pricing
    await db
      .delete(planPricing)
      .where(eq(planPricing.id, pricingId));

    // Get request metadata
    const metadata = getRequestMetadata(req);
    const adminUserId = req.headers.get('x-user-id') || null;

    // Create audit log
    await createAuditLog({
      userId: adminUserId,
      actorType: 'admin',
      action: 'delete',
      entityType: 'plan_pricing',
      entityId: pricingId,
      entityName: `${plan[0]?.name || 'Plan'} - ${existing[0].billingCycle}`,
      httpMethod: 'DELETE',
      endpoint: `/api/admin/plans/${planId}/pricing/${pricingId}`,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      details: {
        billingCycle: existing[0].billingCycle,
        price: Number(existing[0].price),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Pricing option deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting plan pricing:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete plan pricing',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

