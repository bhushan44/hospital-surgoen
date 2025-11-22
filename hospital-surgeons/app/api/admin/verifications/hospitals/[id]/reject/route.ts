import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hospitals, auditLogs } from '@/src/db/drizzle/migrations/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const hospitalId = params.id;
    const body = await req.json();
    const { reason, notes } = body;

    if (!reason) {
      return NextResponse.json(
        { success: false, message: 'Rejection reason is required' },
        { status: 400 }
      );
    }

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
        licenseVerificationStatus: 'rejected',
      })
      .where(eq(hospitals.id, hospitalId))
      .returning();

    // Create audit log
    await db.insert(auditLogs).values({
      userId: existingHospital[0].userId,
      actorType: 'admin',
      action: 'reject',
      entityType: 'hospital',
      entityId: hospitalId,
      details: {
        previousStatus: existingHospital[0].licenseVerificationStatus,
        newStatus: 'rejected',
        reason: reason,
        notes: notes || null,
        rejectedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Hospital verification rejected',
      data: {
        id: updatedHospital.id,
        licenseVerificationStatus: updatedHospital.licenseVerificationStatus,
        reason: reason,
      },
    });
  } catch (error) {
    console.error('Error rejecting hospital verification:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to reject hospital verification',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


