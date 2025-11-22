import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { specialties, doctorSpecialties, hospitalDepartments } from '@/src/db/drizzle/migrations/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const specialtyId = params.id;

    // Get specialty with usage counts
    const specialtyResult = await db
      .select({
        id: specialties.id,
        name: specialties.name,
        description: specialties.description,
        // Count doctors using this specialty
        doctorCount: sql<number>`(
          SELECT COUNT(DISTINCT doctor_id)::int 
          FROM doctor_specialties 
          WHERE specialty_id = ${specialtyId}
        )`,
        // Count hospitals using this specialty
        hospitalCount: sql<number>`(
          SELECT COUNT(DISTINCT hospital_id)::int 
          FROM hospital_departments 
          WHERE specialty_id = ${specialtyId}
        )`,
      })
      .from(specialties)
      .where(eq(specialties.id, specialtyId))
      .limit(1);

    if (specialtyResult.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Specialty not found' },
        { status: 404 }
      );
    }

    const specialty = specialtyResult[0];

    return NextResponse.json({
      success: true,
      data: {
        id: specialty.id,
        name: specialty.name,
        description: specialty.description,
        activeDoctors: specialty.doctorCount || 0,
        activeHospitals: specialty.hospitalCount || 0,
        status: 'Active',
      },
    });
  } catch (error) {
    console.error('Error fetching specialty:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch specialty',
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
    const specialtyId = params.id;
    const body = await req.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Specialty name is required' },
        { status: 400 }
      );
    }

    // Check if specialty exists
    const existing = await db
      .select()
      .from(specialties)
      .where(eq(specialties.id, specialtyId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Specialty not found' },
        { status: 404 }
      );
    }

    // Check if another specialty with same name exists
    const duplicate = await db
      .select()
      .from(specialties)
      .where(eq(specialties.name, name.trim()))
      .limit(1);

    if (duplicate.length > 0 && duplicate[0].id !== specialtyId) {
      return NextResponse.json(
        { success: false, message: 'Specialty with this name already exists' },
        { status: 409 }
      );
    }

    // Update specialty
    const [updatedSpecialty] = await db
      .update(specialties)
      .set({
        name: name.trim(),
        description: description?.trim() || null,
      })
      .where(eq(specialties.id, specialtyId))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Specialty updated successfully',
      data: {
        id: updatedSpecialty.id,
        name: updatedSpecialty.name,
        description: updatedSpecialty.description,
      },
    });
  } catch (error) {
    console.error('Error updating specialty:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update specialty',
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
    const specialtyId = params.id;

    // Check if specialty exists
    const existing = await db
      .select()
      .from(specialties)
      .where(eq(specialties.id, specialtyId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Specialty not found' },
        { status: 404 }
      );
    }

    // Check if specialty is being used by doctors
    const doctorUsage = await db
      .select({ count: sql<number>`count(*)` })
      .from(doctorSpecialties)
      .where(eq(doctorSpecialties.specialtyId, specialtyId));

    const doctorCount = Number(doctorUsage[0]?.count || 0);

    // Check if specialty is being used by hospitals
    const hospitalUsage = await db
      .select({ count: sql<number>`count(*)` })
      .from(hospitalDepartments)
      .where(eq(hospitalDepartments.specialtyId, specialtyId));

    const hospitalCount = Number(hospitalUsage[0]?.count || 0);

    if (doctorCount > 0 || hospitalCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete specialty. It is being used by ${doctorCount} doctor(s) and ${hospitalCount} hospital(s).`,
          data: {
            doctorCount,
            hospitalCount,
          },
        },
        { status: 409 }
      );
    }

    // Delete specialty
    await db
      .delete(specialties)
      .where(eq(specialties.id, specialtyId));

    return NextResponse.json({
      success: true,
      message: 'Specialty deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting specialty:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete specialty',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


