import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { doctorHospitalAffiliations, doctors, hospitals, auditLogs } from '@/src/db/drizzle/migrations/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const affiliationId = params.id;

    const affiliationResult = await db.execute(sql`
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
      WHERE aha.id = ${affiliationId}
    `);

    if (affiliationResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Affiliation not found' },
        { status: 404 }
      );
    }

    const affiliation = affiliationResult.rows[0] as any;

    return NextResponse.json({
      success: true,
      data: {
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
      },
    });
  } catch (error) {
    console.error('Error fetching affiliation:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch affiliation',
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
    const affiliationId = params.id;
    const body = await req.json();
    const { status, isPreferred } = body;

    // Check if affiliation exists
    const existing = await db
      .select()
      .from(doctorHospitalAffiliations)
      .where(eq(doctorHospitalAffiliations.id, affiliationId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Affiliation not found' },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (isPreferred !== undefined) updateData.isPreferred = isPreferred;

    // Update affiliation
    const [updatedAffiliation] = await db
      .update(doctorHospitalAffiliations)
      .set(updateData)
      .where(eq(doctorHospitalAffiliations.id, affiliationId))
      .returning();

    // Create audit log
    await db.insert(auditLogs).values({
      actorType: 'admin',
      action: 'update',
      entityType: 'affiliation',
      entityId: affiliationId,
      details: {
        changes: updateData,
        previousStatus: existing[0].status,
        newStatus: status || existing[0].status,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Affiliation updated successfully',
      data: updatedAffiliation,
    });
  } catch (error) {
    console.error('Error updating affiliation:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update affiliation',
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
    const affiliationId = params.id;

    // Check if affiliation exists
    const existing = await db
      .select()
      .from(doctorHospitalAffiliations)
      .where(eq(doctorHospitalAffiliations.id, affiliationId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Affiliation not found' },
        { status: 404 }
      );
    }

    // Delete affiliation
    await db
      .delete(doctorHospitalAffiliations)
      .where(eq(doctorHospitalAffiliations.id, affiliationId));

    // Create audit log
    await db.insert(auditLogs).values({
      actorType: 'admin',
      action: 'delete',
      entityType: 'affiliation',
      entityId: affiliationId,
      details: {
        doctorId: existing[0].doctorId,
        hospitalId: existing[0].hospitalId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Affiliation deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting affiliation:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete affiliation',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


