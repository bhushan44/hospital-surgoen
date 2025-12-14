import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { doctors, hospitals, subscriptions, subscriptionPlans, doctorPlanFeatures, doctorAssignmentUsage, hospitalUsageTracking } from '@/src/db/drizzle/migrations/schema';
import { eq, and, gte } from 'drizzle-orm';
import { getMaxAssignmentsForDoctor, DEFAULT_ASSIGNMENT_LIMIT } from '@/lib/config/subscription-limits';
import { getMaxPatientsForHospital, getMaxAssignmentsForHospitalFromUser } from '@/lib/config/hospital-subscription-limits';

const CRON_SECRET = process.env.CRON_SECRET;

async function handler(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization');
    const providedSecret = req.headers.get('x-cron-secret');
    const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    const isManualCall = CRON_SECRET && providedSecret === CRON_SECRET;

    if (CRON_SECRET && !isVercelCron && !isManualCall) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // "2024-03"
    
    // Get all doctors
    const allDoctors = await db.select({ id: doctors.id, userId: doctors.userId }).from(doctors);

    let resetCount = 0;
    let updatedCount = 0;

    for (const doctor of allDoctors) {
      // Get max assignments from database (queries doctorPlanFeatures.maxAssignmentsPerMonth)
      const maxAssignments = await getMaxAssignmentsForDoctor(doctor.userId);

      // Calculate reset date (1st of next month)
      const resetDate = new Date();
      resetDate.setMonth(resetDate.getMonth() + 1);
      resetDate.setDate(1);
      resetDate.setHours(0, 0, 0, 0);

      // Check if record exists for current month
      const existing = await db
        .select()
        .from(doctorAssignmentUsage)
        .where(
          and(
            eq(doctorAssignmentUsage.doctorId, doctor.id),
            eq(doctorAssignmentUsage.month, currentMonth)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        // Create new record for current month
        await db.insert(doctorAssignmentUsage).values({
          doctorId: doctor.id,
          month: currentMonth,
          count: 0,
          limitCount: maxAssignments,
          resetDate: resetDate.toISOString(),
        });
        resetCount++;
      } else {
        // Update limit if plan changed, reset count to 0
        await db
          .update(doctorAssignmentUsage)
          .set({
            count: 0,
            limitCount: maxAssignments,
            resetDate: resetDate.toISOString(),
            updatedAt: now.toISOString(),
          })
          .where(
            and(
              eq(doctorAssignmentUsage.doctorId, doctor.id),
              eq(doctorAssignmentUsage.month, currentMonth)
            )
          );
        updatedCount++;
      }
    }

    // Reset hospital usage
    const allHospitals = await db.select({ id: hospitals.id, userId: hospitals.userId }).from(hospitals);
    
    let hospitalResetCount = 0;
    let hospitalUpdatedCount = 0;

    for (const hospital of allHospitals) {
      // Get max patients and assignments from database (queries hospitalPlanFeatures)
      const maxPatients = await getMaxPatientsForHospital(hospital.userId);
      const maxAssignments = await getMaxAssignmentsForHospitalFromUser(hospital.userId);

      // Calculate reset date (1st of next month)
      const resetDate = new Date();
      resetDate.setMonth(resetDate.getMonth() + 1);
      resetDate.setDate(1);
      resetDate.setHours(0, 0, 0, 0);

      // Check if record exists for current month
      const existing = await db
        .select()
        .from(hospitalUsageTracking)
        .where(
          and(
            eq(hospitalUsageTracking.hospitalId, hospital.id),
            eq(hospitalUsageTracking.month, currentMonth)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        // Create new record for current month
        await db.insert(hospitalUsageTracking).values({
          hospitalId: hospital.id,
          month: currentMonth,
          patientsCount: 0,
          assignmentsCount: 0,
          patientsLimit: maxPatients,
          assignmentsLimit: maxAssignments,
          resetDate: resetDate.toISOString(),
        });
        hospitalResetCount++;
      } else {
        // Update limits if plan changed, reset counts to 0
        await db
          .update(hospitalUsageTracking)
          .set({
            patientsCount: 0,
            assignmentsCount: 0,
            patientsLimit: maxPatients,
            assignmentsLimit: maxAssignments,
            resetDate: resetDate.toISOString(),
            updatedAt: now.toISOString(),
          })
          .where(
            and(
              eq(hospitalUsageTracking.hospitalId, hospital.id),
              eq(hospitalUsageTracking.month, currentMonth)
            )
          );
        hospitalUpdatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Reset usage for ${resetCount + updatedCount} doctors and ${hospitalResetCount + hospitalUpdatedCount} hospitals`,
      data: { 
        doctors: {
          resetCount, 
          updatedCount,
          totalProcessed: resetCount + updatedCount,
        },
        hospitals: {
          resetCount: hospitalResetCount,
          updatedCount: hospitalUpdatedCount,
          totalProcessed: hospitalResetCount + hospitalUpdatedCount,
        },
        month: currentMonth 
      },
    });
  } catch (error) {
    console.error('Error resetting assignment usage:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reset usage', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export const GET = handler;
export const POST = handler;



