import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { subscriptions, users, subscriptionPlans } from '@/src/db/drizzle/migrations/schema';
import { eq, and, sql, desc, asc, gte, lte } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const searchParams = req.nextUrl.searchParams;
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Filters
    const status = searchParams.get('status') || undefined;
    const planId = searchParams.get('planId') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const expiringSoon = searchParams.get('expiringSoon') || undefined;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where conditions
    const conditions = [];
    
    if (status) {
      conditions.push(eq(subscriptions.status, status));
    }
    
    if (planId) {
      conditions.push(eq(subscriptions.planId, planId));
    }
    
    if (userId) {
      conditions.push(eq(subscriptions.userId, userId));
    }
    
    if (expiringSoon === 'true') {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      conditions.push(lte(subscriptions.endDate, sevenDaysFromNow.toISOString()));
      conditions.push(gte(subscriptions.endDate, new Date().toISOString()));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(whereClause);
    
    const total = Number(countResult[0]?.count || 0);

    // Get subscriptions with related data
    const subscriptionsList = await db.execute(sql`
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
      ${whereClause ? sql`WHERE ${whereClause}` : sql``}
      ORDER BY s.created_at ${sortOrder === 'asc' ? sql`ASC` : sql`DESC`}
      LIMIT ${limit}
      OFFSET ${offset}
    `);

    // Format response
    const formattedSubscriptions = (subscriptionsList.rows || []).map((sub: any) => ({
      id: sub.id,
      user: {
        id: sub.user_id,
        email: sub.user_email,
        role: sub.user_role,
      },
      plan: {
        id: sub.plan_id,
        name: sub.plan_name,
        tier: sub.plan_tier,
        userRole: sub.plan_user_role,
        price: Number(sub.plan_price) / 100, // Convert from cents
        currency: sub.plan_currency,
      },
      status: sub.status,
      startDate: sub.start_date,
      endDate: sub.end_date,
      autoRenew: sub.auto_renew,
      createdAt: sub.created_at,
      updatedAt: sub.updated_at,
    }));

    return NextResponse.json({
      success: true,
      data: formattedSubscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch subscriptions',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


