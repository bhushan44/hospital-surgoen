import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { users, doctors, hospitals, subscriptions, subscriptionPlans } from '@/src/db/drizzle/migrations/schema';
import { eq, and, or, like, sql, desc, asc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const searchParams = req.nextUrl.searchParams;
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Filters
    const role = searchParams.get('role') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where conditions
    const conditions = [];
    
    if (role && role !== 'all') {
      conditions.push(eq(users.role, role));
    }
    
    if (status && status !== 'all') {
      conditions.push(eq(users.status, status));
    }
    
    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        or(
          like(users.email, searchPattern),
          sql`EXISTS (
            SELECT 1 FROM doctors d 
            WHERE d.user_id = users.id 
            AND (d.first_name || ' ' || d.last_name) ILIKE ${searchPattern}
          )`,
          sql`EXISTS (
            SELECT 1 FROM hospitals h 
            WHERE h.user_id = users.id 
            AND h.name ILIKE ${searchPattern}
          )`
        )!
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(whereClause);
    
    const total = Number(countResult[0]?.count || 0);

    // Get users with related data
    const usersList = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        status: users.status,
        subscriptionStatus: users.subscriptionStatus,
        subscriptionTier: users.subscriptionTier,
        emailVerified: users.emailVerified,
        phoneVerified: users.phoneVerified,
        phone: users.phone,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        // Doctor info
        doctorId: sql<string | null>`d.id`,
        doctorFirstName: sql<string | null>`d.first_name`,
        doctorLastName: sql<string | null>`d.last_name`,
        doctorLicenseStatus: sql<string | null>`d.license_verification_status`,
        // Hospital info
        hospitalId: sql<string | null>`h.id`,
        hospitalName: sql<string | null>`h.name`,
        hospitalLicenseStatus: sql<string | null>`h.license_verification_status`,
        // Subscription info
        subscriptionId: sql<string | null>`s.id`,
        subscriptionPlanName: sql<string | null>`sp.name`,
      })
      .from(users)
      .leftJoin(doctors, eq(users.id, doctors.userId))
      .leftJoin(hospitals, eq(users.id, hospitals.userId))
      .leftJoin(subscriptions, and(
        eq(subscriptions.userId, users.id),
        eq(subscriptions.status, 'active')
      ))
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(whereClause)
      .orderBy(sortOrder === 'asc' ? asc(users[sortBy as keyof typeof users] || users.createdAt) : desc(users[sortBy as keyof typeof users] || users.createdAt))
      .limit(limit)
      .offset(offset);

    // Format response
    const formattedUsers = usersList.map((user) => {
      let name = 'Unknown';
      let verificationStatus = 'pending';
      
      if (user.role === 'doctor' && user.doctorFirstName && user.doctorLastName) {
        name = `Dr. ${user.doctorFirstName} ${user.doctorLastName}`;
        verificationStatus = user.doctorLicenseStatus || 'pending';
      } else if (user.role === 'hospital' && user.hospitalName) {
        name = user.hospitalName;
        verificationStatus = user.hospitalLicenseStatus || 'pending';
      } else if (user.role === 'admin') {
        name = 'Admin User';
        verificationStatus = 'verified';
      }

      return {
        id: user.id,
        name,
        email: user.email,
        role: user.role,
        status: user.status,
        verificationStatus,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionTier: user.subscriptionTier,
        subscriptionPlanName: user.subscriptionPlanName,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        phone: user.phone,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        doctorId: user.doctorId,
        hospitalId: user.hospitalId,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch users',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

