import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { specialties, doctorSpecialties, hospitalDepartments } from '@/src/db/drizzle/migrations/schema';
import { eq, like, sql, desc, asc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const searchParams = req.nextUrl.searchParams;
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Filters
    const search = searchParams.get('search') || undefined;
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Build where conditions
    const conditions = [];
    
    if (search) {
      conditions.push(
        like(specialties.name, `%${search}%`)
      );
    }

    const whereClause = conditions.length > 0 ? conditions[0] : undefined;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(specialties)
      .where(whereClause);
    
    const total = Number(countResult[0]?.count || 0);

    // Map sortBy to actual column references
    const sortColumnMap: Record<string, any> = {
      name: specialties.name,
      id: specialties.id,
    };

    const sortColumn = sortColumnMap[sortBy] || specialties.name;

    // Get specialties with usage counts
    const specialtiesList = await db
      .select({
        id: specialties.id,
        name: specialties.name,
        description: specialties.description,
        // Count doctors using this specialty
        doctorCount: sql<number>`(
          SELECT COUNT(DISTINCT doctor_id)::int 
          FROM doctor_specialties 
          WHERE specialty_id = ${specialties.id}
        )`,
        // Count hospitals using this specialty
        hospitalCount: sql<number>`(
          SELECT COUNT(DISTINCT hospital_id)::int 
          FROM hospital_departments 
          WHERE specialty_id = ${specialties.id}
        )`,
      })
      .from(specialties)
      .where(whereClause)
      .orderBy(sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn))
      .limit(limit)
      .offset(offset);

    // Format response
    const formattedSpecialties = specialtiesList.map((specialty) => ({
      id: specialty.id,
      name: specialty.name,
      description: specialty.description,
      activeDoctors: specialty.doctorCount || 0,
      activeHospitals: specialty.hospitalCount || 0,
      status: 'Active', // Specialties are always active in the schema
    }));

    return NextResponse.json({
      success: true,
      data: formattedSpecialties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching specialties:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch specialties',
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
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Specialty name is required' },
        { status: 400 }
      );
    }

    // Check if specialty with same name already exists
    const existing = await db
      .select()
      .from(specialties)
      .where(eq(specialties.name, name.trim()))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Specialty with this name already exists' },
        { status: 409 }
      );
    }

    // Create new specialty
    const [newSpecialty] = await db
      .insert(specialties)
      .values({
        name: name.trim(),
        description: description?.trim() || null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Specialty created successfully',
      data: {
        id: newSpecialty.id,
        name: newSpecialty.name,
        description: newSpecialty.description,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating specialty:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create specialty',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



