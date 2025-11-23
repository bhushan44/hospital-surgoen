import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { doctorHospitalAffiliations, doctors, hospitals, users, auditLogs } from '@/src/db/drizzle/migrations/schema';
import { eq, and, or, sql, desc, asc } from 'drizzle-orm';

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
    const doctorId = searchParams.get('doctorId') || undefined;
    const hospitalId = searchParams.get('hospitalId') || undefined;
    const isPreferred = searchParams.get('isPreferred') || undefined;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where conditions
    const conditions = [];
    
    if (status) {
      conditions.push(eq(doctorHospitalAffiliations.status, status));
    }
    
    if (doctorId) {
      conditions.push(eq(doctorHospitalAffiliations.doctorId, doctorId));
    }
    
    if (hospitalId) {
      conditions.push(eq(doctorHospitalAffiliations.hospitalId, hospitalId));
    }
    
    if (isPreferred !== undefined && isPreferred !== null) {
      conditions.push(eq(doctorHospitalAffiliations.isPreferred, isPreferred === 'true'));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(doctorHospitalAffiliations)
      .where(whereClause);
    
    const total = Number(countResult[0]?.count || 0);

    // Get affiliations with related data
    const affiliationsList = await db.execute(sql`
      SELECT 
        aha.*,
        d.first_name as doctor_first_name,
        d.last_name as doctor_last_name,
        d.id as doctor_id,
        h.name as hospital_name,
        h.id as hospital_id
      FROM doctor_hospital_affiliations aha
      LEFT JOIN doctors d ON aha.doctor_id = d.id
      LEFT JOIN hospitals h ON aha.hospital_id = h.id
      ${whereClause ? sql`WHERE ${whereClause}` : sql``}
      ORDER BY aha.created_at ${sortOrder === 'asc' ? sql`ASC` : sql`DESC`}
      LIMIT ${limit}
      OFFSET ${offset}
    `);

    // Format response
    const formattedAffiliations = (affiliationsList.rows || []).map((affiliation: any) => ({
      id: affiliation.id,
      doctor: {
        id: affiliation.doctor_id,
        name: `Dr. ${affiliation.doctor_first_name || ''} ${affiliation.doctor_last_name || ''}`.trim() || 'Unknown',
      },
      hospital: {
        id: affiliation.hospital_id,
        name: affiliation.hospital_name || 'Unknown',
      },
      status: affiliation.status,
      isPreferred: affiliation.is_preferred,
      createdAt: affiliation.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: formattedAffiliations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching affiliations:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch affiliations',
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
    const { doctorId, hospitalId, status = 'active', isPreferred = false } = body;

    if (!doctorId || !hospitalId) {
      return NextResponse.json(
        { success: false, message: 'Doctor ID and Hospital ID are required' },
        { status: 400 }
      );
    }

    // Check if affiliation already exists
    const existing = await db
      .select()
      .from(doctorHospitalAffiliations)
      .where(
        and(
          eq(doctorHospitalAffiliations.doctorId, doctorId),
          eq(doctorHospitalAffiliations.hospitalId, hospitalId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Affiliation already exists' },
        { status: 409 }
      );
    }

    // Create new affiliation
    const [newAffiliation] = await db
      .insert(doctorHospitalAffiliations)
      .values({
        doctorId,
        hospitalId,
        status,
        isPreferred,
      })
      .returning();

    // Create audit log
    await db.insert(auditLogs).values({
      actorType: 'admin',
      action: 'create',
      entityType: 'affiliation',
      entityId: newAffiliation.id,
      details: {
        doctorId,
        hospitalId,
        status,
        isPreferred,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Affiliation created successfully',
      data: newAffiliation,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating affiliation:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create affiliation',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





