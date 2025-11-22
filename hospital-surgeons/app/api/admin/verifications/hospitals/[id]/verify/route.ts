import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hospitals, auditLogs } from '@/src/db/drizzle/migrations/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    const hospitalId = id;
    const body = await req.json();
    const { notes } = body;

    // Check if hospital exists
    const existingHospital = await db
      .select()
      .from(hospitals)
      .where(eq(hospitals.id, hospitalId))
      .limit(1);

    if (existingHospital.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Hospital not found' },
        { status: 404 }
      );
    }

    // Update hospital verification status
    const [updatedHospital] = await db
      .update(hospitals)
      .set({
        licenseVerificationStatus: 'verified',
      })
      .where(eq(hospitals.id, hospitalId))
      .returning();

    // Create audit log
    await db.insert(auditLogs).values({
      userId: existingHospital[0].userId,
      actorType: 'admin',
      action: 'verify',
      entityType: 'hospital',
      entityId: hospitalId,
      details: {
        previousStatus: existingHospital[0].licenseVerificationStatus,
        newStatus: 'verified',
        notes: notes || 'Hospital verified by admin',
        verifiedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Hospital verified successfully',
      data: {
        id: updatedHospital.id,
        licenseVerificationStatus: updatedHospital.licenseVerificationStatus,
      },
    });
  } catch (error) {
    console.error('Error verifying hospital:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to verify hospital',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


