import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { auditLogs, users } from '@/src/db/drizzle/migrations/schema';
import { eq, and, or, sql, desc, asc, gte, lte } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const searchParams = req.nextUrl.searchParams;
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Filters
    const actorType = searchParams.get('actorType') || undefined;
    const action = searchParams.get('action') || undefined;
    const entityType = searchParams.get('entityType') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where conditions
    const conditions = [];
    
    if (actorType) {
      conditions.push(eq(auditLogs.actorType, actorType));
    }
    
    if (action) {
      conditions.push(eq(auditLogs.action, action));
    }
    
    if (entityType) {
      conditions.push(eq(auditLogs.entityType, entityType));
    }
    
    if (userId) {
      conditions.push(eq(auditLogs.userId, userId));
    }
    
    if (startDate) {
      conditions.push(gte(auditLogs.createdAt, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(auditLogs.createdAt, endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .where(whereClause);
    
    const total = Number(countResult[0]?.count || 0);

    // Get audit logs with user info
    const logsList = await db.execute(sql`
      SELECT 
        al.*,
        u.email as user_email,
        u.role as user_role
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ${whereClause ? sql`WHERE ${whereClause}` : sql``}
      ORDER BY al.created_at ${sortOrder === 'asc' ? sql`ASC` : sql`DESC`}
      LIMIT ${limit}
      OFFSET ${offset}
    `);

    // Format response
    const formattedLogs = (logsList.rows || []).map((log: any) => ({
      id: log.id,
      userId: log.user_id,
      userEmail: log.user_email,
      userRole: log.user_role,
      actorType: log.actor_type,
      action: log.action,
      entityType: log.entity_type,
      entityId: log.entity_id,
      details: log.details,
      createdAt: log.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: formattedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch audit logs',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


