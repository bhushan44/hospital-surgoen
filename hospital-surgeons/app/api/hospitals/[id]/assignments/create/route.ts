import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { assignments, doctorAvailability, enumPriority } from '@/src/db/drizzle/migrations/schema';
import { eq, and, sql } from 'drizzle-orm';

/**
 * Create a new assignment
 * POST /api/hospitals/[id]/assignments/create
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const hospitalId = params.id;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(hospitalId) || hospitalId === 'hospital-id-placeholder') {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid hospital ID',
        },
        { status: 400 }
      );
    }
    
    const db = getDb();
    
    // Validate request body with Zod
    const { CreateAssignmentDtoSchema } = await import('@/lib/validations/assignment.dto');
    const { validateRequest } = await import('@/lib/utils/validate-request');
    
    const validation = await validateRequest(req, CreateAssignmentDtoSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { patientId, doctorId, availabilitySlotId, priority = 'routine', consultationFee } = validation.data;

    // Calculate expiresAt based on priority
    const expiresAt = new Date();
    if (priority === 'routine') {
      expiresAt.setHours(expiresAt.getHours() + 24);
    } else if (priority === 'urgent') {
      expiresAt.setHours(expiresAt.getHours() + 6);
    } else if (priority === 'emergency') {
      expiresAt.setHours(expiresAt.getHours() + 1);
    }

    // Verify priority exists in enum
    const priorityCheck = await db
      .select()
      .from(enumPriority)
      .where(eq(enumPriority.priority, priority))
      .limit(1);

    if (priorityCheck.length === 0) {
      // Insert priority if it doesn't exist
      await db.insert(enumPriority).values({
        priority,
        description: `${priority} priority assignment`,
      }).onConflictDoNothing();
    }

    // Create assignment
    const newAssignment = await db
      .insert(assignments)
      .values({
        hospitalId,
        doctorId,
        patientId,
        availabilitySlotId,
        priority,
        status: 'pending',
        expiresAt: expiresAt.toISOString(),
        consultationFee: consultationFee ? String(consultationFee) : null,
      })
      .returning();

    // Mark availability slot as booked
    await db
      .update(doctorAvailability)
      .set({
        status: 'booked',
        bookedByHospitalId: hospitalId,
        bookedAt: new Date().toISOString(),
      })
      .where(eq(doctorAvailability.id, availabilitySlotId));

    return NextResponse.json({
      success: true,
      data: newAssignment[0],
      message: 'Assignment created successfully',
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create assignment',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

