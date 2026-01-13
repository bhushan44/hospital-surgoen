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

    const { patientId, doctorId, parentSlotId, startTime, endTime, availabilitySlotId, priority = 'routine', consultationFee } = validation.data;

    // Check hospital assignment limit first
    const { HospitalUsageService } = await import('@/lib/services/hospital-usage.service');
    const hospitalUsageService = new HospitalUsageService();
    
    try {
      await hospitalUsageService.checkAssignmentLimit(hospitalId);
    } catch (error: any) {
      if (error.message === 'HOSPITAL_ASSIGNMENT_LIMIT_REACHED') {
        // Get current usage for better error message
        try {
          const usage = await hospitalUsageService.getUsage(hospitalId);
          return NextResponse.json(
            {
              success: false,
              message: `Your hospital has reached its monthly assignment limit (${usage.assignments.used}/${usage.assignments.limit === -1 ? 'unlimited' : usage.assignments.limit} assignments used). Your limit will reset on ${new Date(usage.resetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}. Upgrade your plan to create more assignments now.`,
              code: 'HOSPITAL_ASSIGNMENT_LIMIT_REACHED',
              error: 'HOSPITAL_ASSIGNMENT_LIMIT_REACHED',
              usage: {
                used: usage.assignments.used,
                limit: usage.assignments.limit,
                resetDate: usage.resetDate,
              },
            },
            { status: 403 }
          );
        } catch {
          // Fallback if usage fetch fails
          return NextResponse.json(
            {
              success: false,
              message: 'Your hospital has reached its monthly assignment limit. Upgrade your plan to create more assignments.',
              code: 'HOSPITAL_ASSIGNMENT_LIMIT_REACHED',
              error: 'HOSPITAL_ASSIGNMENT_LIMIT_REACHED',
            },
            { status: 403 }
          );
        }
      }
      throw error;
    }

    // Check doctor assignment limit
    try {
      await checkAssignmentLimit(doctorId, db);
    } catch (error: any) {
      if (error.message === 'ASSIGNMENT_LIMIT_REACHED') {
        // Get doctor info for better error message
        try {
          const doctor = await db
            .select({
              firstName: doctors.firstName,
              lastName: doctors.lastName,
            })
            .from(doctors)
            .where(eq(doctors.id, doctorId))
            .limit(1);

          const doctorName = doctor.length > 0 
            ? `Dr. ${doctor[0].firstName} ${doctor[0].lastName}`
            : 'This doctor';

          // Get usage info
          const currentMonth = new Date().toISOString().slice(0, 7);
          const usage = await db
            .select()
            .from(doctorAssignmentUsage)
            .where(
              and(
                eq(doctorAssignmentUsage.doctorId, doctorId),
                eq(doctorAssignmentUsage.month, currentMonth)
              )
            )
            .limit(1);

          const usageData = usage.length > 0 ? usage[0] : null;
          const resetDate = usageData?.resetDate 
            ? new Date(usageData.resetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'the 1st of next month';

          return NextResponse.json(
            {
              success: false,
              message: `${doctorName} has reached their monthly assignment limit (${usageData?.count || 0}/${usageData?.limitCount || 'N/A'} assignments used). The limit will reset on ${resetDate}. Please try another doctor.`,
              code: 'ASSIGNMENT_LIMIT_REACHED',
              error: 'ASSIGNMENT_LIMIT_REACHED',
              usage: usageData ? {
                used: usageData.count,
                limit: usageData.limitCount,
                resetDate: usageData.resetDate,
              } : null,
            },
            { status: 403 }
          );
        } catch {
          // Fallback if info fetch fails
          return NextResponse.json(
            {
              success: false,
              message: 'This doctor has reached their monthly assignment limit. Please try another doctor.',
              code: 'ASSIGNMENT_LIMIT_REACHED',
              error: 'ASSIGNMENT_LIMIT_REACHED',
            },
            { status: 403 }
          );
        }
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

    // Determine which slot to use (parent slot -> create sub-slot, or use existing sub-slot)
    let finalAvailabilitySlotId: string;
    const { DoctorsRepository } = await import('@/lib/repositories/doctors.repository');
    const doctorsRepository = new DoctorsRepository();

    if (parentSlotId && startTime && endTime) {
      // NEW FLOW: Create sub-slot from parent slot
      
      // 1. Get and validate parent slot
      const parentSlot = await doctorsRepository.getParentSlot(parentSlotId);
      if (!parentSlot) {
        return NextResponse.json(
          {
            success: false,
            message: 'Parent slot not found or is not a valid parent slot',
            error: 'PARENT_SLOT_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      // 2. Validate time range fits within parent slot
      if (!doctorsRepository.fitsWithinParent(
        parentSlot.startTime,
        parentSlot.endTime,
        startTime,
        endTime
      )) {
        return NextResponse.json(
          {
            success: false,
            message: `Selected time range (${startTime}-${endTime}) does not fit within parent slot (${parentSlot.startTime}-${parentSlot.endTime})`,
            error: 'TIME_RANGE_OUT_OF_BOUNDS',
          },
          { status: 400 }
        );
      }

      // 3. Check for overlapping sub-slots
      const hasOverlap = await doctorsRepository.hasOverlappingSubSlots(
        parentSlotId,
        startTime,
        endTime
      );

      if (hasOverlap) {
        return NextResponse.json(
          {
            success: false,
            message: `Selected time range (${startTime}-${endTime}) overlaps with an existing booking`,
            error: 'TIME_OVERLAP',
          },
          { status: 400 }
        );
      }

      // 4. Create sub-slot
      const subSlotResult = await doctorsRepository.createAvailability(
        {
          slotDate: parentSlot.slotDate,
          startTime,
          endTime,
          parentSlotId: parentSlotId,
          status: 'booked',
          isManual: false,
          notes: `Sub-slot created for assignment`,
        },
        doctorId
      );

      const subSlot = Array.isArray(subSlotResult) ? subSlotResult[0] : subSlotResult;
      if (!subSlot || !subSlot.id) {
        return NextResponse.json(
          {
            success: false,
            message: 'Failed to create sub-slot',
            error: 'SUB_SLOT_CREATION_FAILED',
          },
          { status: 500 }
        );
      }

      // 5. Update sub-slot with booking info
      await db
        .update(doctorAvailability)
        .set({
          bookedByHospitalId: hospitalId,
          bookedAt: new Date().toISOString(),
        })
        .where(eq(doctorAvailability.id, subSlot.id));

      finalAvailabilitySlotId = subSlot.id;
    } else if (availabilitySlotId) {
      // OLD FLOW: Direct slot reference (backward compatibility)
      // Check if it's a parent slot - if so, reject (must use parentSlotId flow)
      const slot = await db
        .select({ id: doctorAvailability.id, parentSlotId: doctorAvailability.parentSlotId })
        .from(doctorAvailability)
        .where(eq(doctorAvailability.id, availabilitySlotId))
        .limit(1);

      if (slot.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: 'Availability slot not found',
            error: 'SLOT_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      // If it's a parent slot, reject (must use parentSlotId + time range)
      if (!slot[0].parentSlotId) {
        return NextResponse.json(
          {
            success: false,
            message: 'Cannot book parent slot directly. Please provide parentSlotId with startTime and endTime to create a sub-slot',
            error: 'PARENT_SLOT_CANNOT_BE_BOOKED_DIRECTLY',
          },
          { status: 400 }
        );
      }

      // It's a sub-slot, mark as booked
      await db
        .update(doctorAvailability)
        .set({
          status: 'booked',
          bookedByHospitalId: hospitalId,
          bookedAt: new Date().toISOString(),
        })
        .where(eq(doctorAvailability.id, availabilitySlotId));

      finalAvailabilitySlotId = availabilitySlotId;
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Either parentSlotId with startTime/endTime or availabilitySlotId must be provided',
          error: 'MISSING_SLOT_INFO',
        },
        { status: 400 }
      );
    }

    // Create assignment
    const newAssignment = await db
      .insert(assignments)
      .values({
        hospitalId,
        doctorId,
        patientId,
        availabilitySlotId: finalAvailabilitySlotId,
        priority,
        status: 'pending',
        expiresAt: expiresAt.toISOString(),
        consultationFee: consultationFee ? String(consultationFee) : null,
      })
      .returning();

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

    // Send push notification to doctor about new assignment
    try {
      console.log('📬 [ASSIGNMENT CREATE] Attempting to send push notification to doctor');
      console.log(`📬 [ASSIGNMENT CREATE] Assignment ID: ${newAssignment[0].id}`);
      console.log(`📬 [ASSIGNMENT CREATE] Doctor ID: ${doctorId}`);
      
      // Get doctor's userId
      const doctor = await db
        .select({ userId: doctors.userId })
        .from(doctors)
        .where(eq(doctors.id, doctorId))
        .limit(1);

      if (doctor.length > 0 && doctor[0].userId) {
        console.log(`📬 [ASSIGNMENT CREATE] Doctor User ID: ${doctor[0].userId}`);
        
        const { NotificationsService } = await import('@/lib/services/notifications.service');
        const notificationsService = new NotificationsService();

        const baseUrl = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000';
        const deepLink = 'hospitalapp://view_assignment';

        console.log(`📬 [ASSIGNMENT CREATE] Sending notification: New Assignment Request`);
        console.log(`📬 [ASSIGNMENT CREATE] Hospital: ${hospitalName}, Patient: ${patientName}`);

        await notificationsService.sendPushNotification(doctor[0].userId, {
          userId: doctor[0].userId,
          recipientType: 'user',
          notificationType: 'booking',
          title: 'New Assignment Request',
          message: `You have a new assignment from ${hospitalName} - ${patientName}`,
          channel: 'push',
          priority: priority === 'emergency' ? 'urgent' : priority === 'urgent' ? 'high' : 'medium',
          assignmentId: newAssignment[0].id,
          payload: {
            notificationType: 'assignment_created',
            assignmentId: newAssignment[0].id,
            hospitalId: hospitalId,
            hospitalName: hospitalName,
            doctorId: doctorId,
            patientId: patientId,
            patientName: patientName,
            priority: priority,
            scheduledTime: startTime || endTime || new Date().toISOString(),
            consultationFee: consultationFee || null,
            deepLink: deepLink,
          },
        });

        console.log(`✅ [ASSIGNMENT CREATE] Push notification process completed for doctor ${doctorId}`);
        console.log(`✅ [ASSIGNMENT CREATE] Assignment ID: ${newAssignment[0].id}`);
      } else {
        console.warn(`⚠️  [ASSIGNMENT CREATE] Doctor User ID not found for doctor ${doctorId}`);
        console.warn(`⚠️  [ASSIGNMENT CREATE] Push notification skipped`);
      }
    } catch (notificationError) {
      // Don't fail assignment creation if notification fails
      console.error('❌ [ASSIGNMENT CREATE] FAILURE: Exception while sending push notification to doctor');
      console.error(`❌ [ASSIGNMENT CREATE] Assignment ID: ${newAssignment[0].id}`);
      console.error(`❌ [ASSIGNMENT CREATE] Doctor ID: ${doctorId}`);
      console.error('❌ [ASSIGNMENT CREATE] Error:', notificationError instanceof Error ? notificationError.message : String(notificationError));
      console.error('❌ [ASSIGNMENT CREATE] Stack:', notificationError instanceof Error ? notificationError.stack : 'No stack trace');
    }

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

