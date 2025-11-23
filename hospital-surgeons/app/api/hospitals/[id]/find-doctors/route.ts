import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { doctors, doctorSpecialties, specialties, doctorAvailability, hospitals, subscriptions, subscriptionPlans } from '@/src/db/drizzle/migrations/schema';
import { eq, and, or, sql, desc, asc, gte } from 'drizzle-orm';

/**
 * Find available doctors for a hospital
 * GET /api/hospitals/[id]/find-doctors
 * 
 * Maps subscription tiers: basic -> gold, enterprise -> premium
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const hospitalId = params.id;
    
    // Validate UUID format - return empty data for placeholder
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(hospitalId) || hospitalId === 'hospital-id-placeholder') {
      return NextResponse.json({
        success: true,
        data: {
          doctors: [],
          hospitalSubscription: 'free',
        },
      });
    }
    
    const db = getDb();
    const searchParams = req.nextUrl.searchParams;

    const specialtyId = searchParams.get('specialtyId') || undefined;
    const date = searchParams.get('date') || undefined;
    const priority = searchParams.get('priority') || 'routine';

    // Get hospital's subscription tier
    const hospitalResult = await db
      .select({
        userId: hospitals.userId,
      })
      .from(hospitals)
      .where(eq(hospitals.id, hospitalId))
      .limit(1);

    let hospitalSubscriptionTier: 'free' | 'gold' | 'premium' = 'free';
    if (hospitalResult[0]?.userId) {
      const subscriptionResult = await db
        .select({
          tier: subscriptionPlans.tier,
        })
        .from(subscriptions)
        .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
        .where(
          and(
            eq(subscriptions.userId, hospitalResult[0].userId),
            eq(subscriptions.status, 'active')
          )
        )
        .limit(1);

      if (subscriptionResult[0]?.tier) {
        // Map subscription tiers: basic -> gold, enterprise -> premium
        const tier = subscriptionResult[0].tier;
        if (tier === 'basic') {
          hospitalSubscriptionTier = 'gold';
        } else if (tier === 'enterprise') {
          hospitalSubscriptionTier = 'premium';
        } else if (tier === 'premium') {
          hospitalSubscriptionTier = 'premium';
        } else {
          hospitalSubscriptionTier = 'free';
        }
      }
    }

    // Build doctor query
    const conditions = [];
    
    // Filter by specialty if provided
    if (specialtyId) {
      conditions.push(
        sql`EXISTS (SELECT 1 FROM doctor_specialties WHERE doctor_id = ${doctors.id} AND specialty_id = ${specialtyId})`
      );
    }

    // Get doctors with their specialties and availability
    const doctorsList = await db
      .select({
        id: doctors.id,
        firstName: doctors.firstName,
        lastName: doctors.lastName,
        yearsOfExperience: doctors.yearsOfExperience,
        averageRating: doctors.averageRating,
        totalRatings: doctors.totalRatings,
        completedAssignments: doctors.completedAssignments,
        // Get specialties
        specialties: sql<string[]>`ARRAY(SELECT s.name FROM specialties s INNER JOIN doctor_specialties ds ON s.id = ds.specialty_id WHERE ds.doctor_id = ${doctors.id})`,
        // Get available slots for the date
        availableSlots: sql<string[]>`ARRAY(
          SELECT start_time::text 
          FROM doctor_availability 
          WHERE doctor_id = ${doctors.id} 
            AND slot_date = ${date || 'CURRENT_DATE'}::date
            AND status = 'available'
          ORDER BY start_time
        )`,
      })
      .from(doctors)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(doctors.averageRating));

    // Format doctors with tier and requiredPlan mapping
    // Since schema doesn't have these fields, we'll derive them from rating and experience
    const formattedDoctors = doctorsList.map((doctor) => {
      const rating = doctor.averageRating ? Number(doctor.averageRating) : 0;
      const experience = doctor.yearsOfExperience || 0;
      const completed = doctor.completedAssignments || 0;

      // Derive tier based on rating and experience
      let tier: 'platinum' | 'gold' | 'silver' = 'silver';
      let requiredPlan: 'free' | 'gold' | 'premium' = 'free';

      if (rating >= 4.8 && experience >= 15 && completed >= 400) {
        tier = 'platinum';
        requiredPlan = 'premium';
      } else if (rating >= 4.6 && experience >= 10 && completed >= 200) {
        tier = 'gold';
        requiredPlan = 'gold';
      } else {
        tier = 'silver';
        requiredPlan = 'free';
      }

      // Format time slots
      const slots = (doctor.availableSlots || []).map((slot: string) => {
        if (!slot) return null;
        // Convert time format (HH:MM:SS) to readable format
        const [hours, minutes] = slot.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
      }).filter(Boolean) as string[];

      return {
        id: doctor.id,
        name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        specialty: doctor.specialties?.[0] || 'General Medicine',
        tier,
        requiredPlan,
        experience,
        rating: rating || 0,
        reviews: doctor.totalRatings || 0,
        completedAssignments: completed,
        photo: null,
        availableSlots: slots.length > 0 ? slots : ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'], // Default slots
        fee: 1000 + (experience * 100), // Calculate fee based on experience
      };
    });

    // Filter doctors based on subscription access
    const accessibleDoctors = formattedDoctors.filter((doctor) => {
      const planHierarchy = { free: 0, gold: 1, premium: 2 };
      const doctorRequired = planHierarchy[doctor.requiredPlan as keyof typeof planHierarchy];
      const hospitalHas = planHierarchy[hospitalSubscriptionTier];
      return hospitalHas >= doctorRequired;
    });

    // Sort: accessible first, then by tier
    accessibleDoctors.sort((a, b) => {
      const aAccessible = planHierarchy[hospitalSubscriptionTier] >= planHierarchy[a.requiredPlan as keyof typeof planHierarchy];
      const bAccessible = planHierarchy[hospitalSubscriptionTier] >= planHierarchy[b.requiredPlan as keyof typeof planHierarchy];
      if (aAccessible !== bAccessible) return bAccessible ? 1 : -1;
      
      const tierOrder = { platinum: 0, gold: 1, silver: 2 };
      return tierOrder[a.tier] - tierOrder[b.tier];
    });

    return NextResponse.json({
      success: true,
      data: {
        doctors: accessibleDoctors,
        hospitalSubscription: hospitalSubscriptionTier,
      },
    });
  } catch (error) {
    console.error('Error finding doctors:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to find doctors',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

const planHierarchy = { free: 0, gold: 1, premium: 2 };

