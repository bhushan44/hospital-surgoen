import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { assignments, doctorAvailability, enumPriority, doctors, subscriptions, subscriptionPlans, doctorPlanFeatures, doctorAssignmentUsage, hospitals, patients, users } from '@/src/db/drizzle/migrations/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getMaxAssignmentsForDoctor, DEFAULT_ASSIGNMENT_LIMIT } from '@/lib/config/subscription-limits';
import { createAuditLog, getRequestMetadata } from '@/lib/utils/audit-logger';

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

    // Check hospital assignment limit first
    const { HospitalUsageService } = await import('@/lib/services/hospital-usage.service');
    const hospitalUsageService = new HospitalUsageService();
    
    try {
      await hospitalUsageService.checkAssignmentLimit(hospitalId);
    } catch (error: any) {
      if (error.message === 'HOSPITAL_ASSIGNMENT_LIMIT_REACHED') {
        return NextResponse.json(
          {
            success: false,
            message: 'Your hospital has reached its monthly assignment limit. Upgrade your plan to create more assignments.',
            code: 'HOSPITAL_ASSIGNMENT_LIMIT_REACHED',
          },
          { status: 403 }
        );
      }
      throw error;
    }

    // Check doctor assignment limit
    try {
      await checkAssignmentLimit(doctorId, db);
    } catch (error: any) {
      if (error.message === 'ASSIGNMENT_LIMIT_REACHED') {
        return NextResponse.json(
          {
            success: false,
            message: 'This doctor has reached their monthly assignment limit. Please try another doctor.',
            code: 'ASSIGNMENT_LIMIT_REACHED',
          },
          { status: 403 }
        );
      }
      throw error;
    }

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
    if (availabilitySlotId) {
      await db
        .update(doctorAvailability)
        .set({
          status: 'booked',
          bookedByHospitalId: hospitalId,
          bookedAt: new Date().toISOString(),
        })
        .where(eq(doctorAvailability.id, availabilitySlotId));
    }

    // Increment assignment usage count for both hospital and doctor
    await hospitalUsageService.incrementAssignmentUsage(hospitalId);
    await incrementAssignmentUsage(doctorId, db);

    // Get request metadata and entity names for audit log
    const metadata = getRequestMetadata(req);
    const hospitalUserId = req.headers.get('x-user-id') || null;

    // Get hospital, doctor, and patient names
    const [hospitalResult, doctorResult, patientResult] = await Promise.all([
      db.select({ name: hospitals.name }).from(hospitals).where(eq(hospitals.id, hospitalId)).limit(1),
      db.select({ firstName: doctors.firstName, lastName: doctors.lastName }).from(doctors).where(eq(doctors.id, doctorId)).limit(1),
      db.select({ fullName: patients.fullName }).from(patients).where(eq(patients.id, patientId)).limit(1),
    ]);

    const hospitalName = hospitalResult[0]?.name || null;
    const doctorName = doctorResult[0] ? `Dr. ${doctorResult[0].firstName} ${doctorResult[0].lastName}` : null;
    const patientName = patientResult[0]?.fullName || null;

    // Create comprehensive audit log
    await createAuditLog({
      userId: hospitalUserId,
      actorType: 'user',
      action: 'create',
      entityType: 'assignment',
      entityId: newAssignment[0].id,
      entityName: `Assignment: ${doctorName} → ${patientName}`,
      httpMethod: 'POST',
      endpoint: `/api/hospitals/${hospitalId}/assignments/create`,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      details: {
        hospitalId,
        hospitalName,
        doctorId,
        doctorName,
        patientId,
        patientName,
        priority,
        consultationFee: consultationFee || null,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString(),
      },
    });

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

// Helper function: Check assignment limit
async function checkAssignmentLimit(doctorId: string, db: any) {
  // Get doctor's userId
  const doctor = await db
    .select({ userId: doctors.userId })
    .from(doctors)
    .where(eq(doctors.id, doctorId))
    .limit(1);

  if (doctor.length === 0) {
    throw new Error('Doctor not found');
  }

  // Get max assignments from database (queries doctorPlanFeatures.maxAssignmentsPerMonth)
  const maxAssignments = await getMaxAssignmentsForDoctor(doctor[0].userId);

  // If unlimited, skip check
  if (maxAssignments === -1) {
    return;
  }

  // Get or create usage record for current month
  const currentMonth = new Date().toISOString().slice(0, 7); // "2024-03"
  
  let usage = await db
    .select()
    .from(doctorAssignmentUsage)
    .where(
      and(
        eq(doctorAssignmentUsage.doctorId, doctorId),
        eq(doctorAssignmentUsage.month, currentMonth)
      )
    )
    .limit(1);

  if (usage.length === 0) {
    // Create new usage record
    const resetDate = new Date();
    resetDate.setMonth(resetDate.getMonth() + 1);
    resetDate.setDate(1);
    resetDate.setHours(0, 0, 0, 0);

    [usage] = await db
      .insert(doctorAssignmentUsage)
      .values({
        doctorId,
        month: currentMonth,
        count: 0,
        limitCount: maxAssignments,
        resetDate: resetDate.toISOString(),
      })
      .returning();
  }

  const usageData = usage[0] || usage;

  // Check if limit reached
  if (usageData.count >= maxAssignments) {
    throw new Error('ASSIGNMENT_LIMIT_REACHED');
  }
}

// Helper function: Increment assignment usage
async function incrementAssignmentUsage(doctorId: string, db: any) {
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Get or create usage record
  let usage = await db
    .select()
    .from(doctorAssignmentUsage)
    .where(
      and(
        eq(doctorAssignmentUsage.doctorId, doctorId),
        eq(doctorAssignmentUsage.month, currentMonth)
      )
    )
    .limit(1);

  if (usage.length === 0) {
    // Get doctor's userId to determine limit
    const doctor = await db
      .select({ userId: doctors.userId })
      .from(doctors)
      .where(eq(doctors.id, doctorId))
      .limit(1);

    if (doctor.length === 0) return;

    // Get max assignments from database (queries doctorPlanFeatures.maxAssignmentsPerMonth)
    const maxAssignments = await getMaxAssignmentsForDoctor(doctor[0].userId);

    const resetDate = new Date();
    resetDate.setMonth(resetDate.getMonth() + 1);
    resetDate.setDate(1);
    resetDate.setHours(0, 0, 0, 0);

    await db.insert(doctorAssignmentUsage).values({
      doctorId,
      month: currentMonth,
      count: 1,
      limitCount: maxAssignments,
      resetDate: resetDate.toISOString(),
    });
  } else {
    // Increment existing count
    await db
      .update(doctorAssignmentUsage)
      .set({
        count: sql`${doctorAssignmentUsage.count} + 1`,
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(doctorAssignmentUsage.doctorId, doctorId),
          eq(doctorAssignmentUsage.month, currentMonth)
        )
      );
  }
}

