import { NextRequest, NextResponse } from 'next/server';
import { DoctorsService } from '@/lib/services/doctors.service';
import { getDb } from '@/lib/db';
import { auditLogs } from '@/src/db/drizzle/migrations/schema';

const ALLOWED_STATUSES = ['pending', 'verified', 'rejected'] as const;

type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ credentialId: string }> }
) {
  try {
    const { credentialId } = await params;
    const body = await req.json();
    const { verificationStatus, notes } = body as {
      verificationStatus?: AllowedStatus;
      notes?: string;
    };

    if (!verificationStatus || !ALLOWED_STATUSES.includes(verificationStatus)) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification status' },
        { status: 400 }
      );
    }

    const doctorsService = new DoctorsService();
    const result = await doctorsService.updateCredentialStatus(credentialId, verificationStatus);

    if (!result.success || !result.data) {
      return NextResponse.json(result, { status: 404 });
    }

    const credential = result.data as any;

    const db = getDb();
    await db.insert(auditLogs).values({
      userId: credential.doctorId,
      actorType: 'admin',
      action: verificationStatus === 'verified' ? 'credential_verified' : 'credential_rejected',
      entityType: 'doctor_credential',
      entityId: credentialId,
      details: {
        verificationStatus,
        notes,
      },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Credential updated successfully',
      data: {
        id: credential.id,
        doctorId: credential.doctorId,
        verificationStatus: credential.verificationStatus,
      },
    });
  } catch (error) {
    console.error('Error updating credential status:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update credential status',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

