import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { doctors, auditLogs } from '@/src/db/drizzle/migrations/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const doctorId = params.id;
    const body = await req.json();
    const { notes } = body;

    // Check if doctor exists
    const existingDoctor = await db
      .select()
      .from(doctors)
      .where(eq(doctors.id, doctorId))
      .limit(1);

    if (existingDoctor.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Update doctor verification status
    const [updatedDoctor] = await db
      .update(doctors)
      .set({
        licenseVerificationStatus: 'verified',
      })
      .where(eq(doctors.id, doctorId))
      .returning();

    // Create audit log
    await db.insert(auditLogs).values({
      userId: existingDoctor[0].userId,
      actorType: 'admin',
      action: 'verify',
      entityType: 'doctor',
      entityId: doctorId,
      details: {
        previousStatus: existingDoctor[0].licenseVerificationStatus,
        newStatus: 'verified',
        notes: notes || 'Doctor verified by admin',
        verifiedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Doctor verified successfully',
      data: {
        id: updatedDoctor.id,
        licenseVerificationStatus: updatedDoctor.licenseVerificationStatus,
      },
    });
  } catch (error) {
    console.error('Error verifying doctor:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to verify doctor',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


