import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { doctors, doctorSpecialties, specialties, doctorAvailability, hospitals, subscriptions, subscriptionPlans } from '@/src/db/drizzle/migrations/schema';
import { eq, and, or, sql, desc, asc, gte, inArray, isNull, ne } from 'drizzle-orm';

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

    const searchText = searchParams.get('search') || undefined;
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

    // Build doctor query with search support using Drizzle's sql template
    let doctorQuery: any;
    
    if (searchText && specialtyId) {
      // Both search text and specialty filter
      const searchPattern = `%${searchText.toLowerCase()}%`;
      doctorQuery = sql`
        SELECT 
          d.id,
          d.first_name as "firstName",
          d.last_name as "lastName",
          d.years_of_experience as "yearsOfExperience",
          d.average_rating as "averageRating",
          d.total_ratings as "totalRatings",
          d.completed_assignments as "completedAssignments",
          ARRAY(
            SELECT s.name 
            FROM specialties s 
            INNER JOIN doctor_specialties ds ON s.id = ds.specialty_id 
            WHERE ds.doctor_id = d.id
          ) as specialties
        FROM doctors d
        WHERE (
          LOWER(d.first_name || ' ' || d.last_name) LIKE ${searchPattern} OR
          EXISTS (
            SELECT 1 FROM doctor_specialties ds
            INNER JOIN specialties s ON ds.specialty_id = s.id
            WHERE ds.doctor_id = d.id AND LOWER(s.name) LIKE ${searchPattern}
          )
        )
        AND EXISTS (SELECT 1 FROM doctor_specialties WHERE doctor_id = d.id AND specialty_id = ${specialtyId})
        ORDER BY d.average_rating DESC
        LIMIT 100
      `;
    } else if (searchText) {
      // Only search text
      const searchPattern = `%${searchText.toLowerCase()}%`;
      doctorQuery = sql`
        SELECT 
          d.id,
          d.first_name as "firstName",
          d.last_name as "lastName",
          d.years_of_experience as "yearsOfExperience",
          d.average_rating as "averageRating",
          d.total_ratings as "totalRatings",
          d.completed_assignments as "completedAssignments",
          ARRAY(
            SELECT s.name 
            FROM specialties s 
            INNER JOIN doctor_specialties ds ON s.id = ds.specialty_id 
            WHERE ds.doctor_id = d.id
          ) as specialties
        FROM doctors d
        WHERE (
          LOWER(d.first_name || ' ' || d.last_name) LIKE ${searchPattern} OR
          EXISTS (
            SELECT 1 FROM doctor_specialties ds
            INNER JOIN specialties s ON ds.specialty_id = s.id
            WHERE ds.doctor_id = d.id AND LOWER(s.name) LIKE ${searchPattern}
          )
        )
        ORDER BY d.average_rating DESC
        LIMIT 100
      `;
    } else if (specialtyId) {
      // Only specialty filter
      doctorQuery = sql`
        SELECT 
          d.id,
          d.first_name as "firstName",
          d.last_name as "lastName",
          d.years_of_experience as "yearsOfExperience",
          d.average_rating as "averageRating",
          d.total_ratings as "totalRatings",
          d.completed_assignments as "completedAssignments",
          ARRAY(
            SELECT s.name 
            FROM specialties s 
            INNER JOIN doctor_specialties ds ON s.id = ds.specialty_id 
            WHERE ds.doctor_id = d.id
          ) as specialties
        FROM doctors d
        WHERE EXISTS (SELECT 1 FROM doctor_specialties WHERE doctor_id = d.id AND specialty_id = ${specialtyId})
        ORDER BY d.average_rating DESC
        LIMIT 100
      `;
    } else {
      // No filters - return all doctors
      doctorQuery = sql`
        SELECT 
          d.id,
          d.first_name as "firstName",
          d.last_name as "lastName",
          d.years_of_experience as "yearsOfExperience",
          d.average_rating as "averageRating",
          d.total_ratings as "totalRatings",
          d.completed_assignments as "completedAssignments",
          ARRAY(
            SELECT s.name 
            FROM specialties s 
            INNER JOIN doctor_specialties ds ON s.id = ds.specialty_id 
            WHERE ds.doctor_id = d.id
          ) as specialties
        FROM doctors d
        ORDER BY d.average_rating DESC
        LIMIT 100
      `;
    }
    
    const doctorsList = await db.execute(doctorQuery);
    
    // Get list of doctor IDs from the results
    const doctorIds = doctorsList.rows.map((row: any) => row.id);
    
    // Fetch availability slots for each doctor for the specified date
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Group availability by doctor ID
    const availabilityByDoctor: Record<string, any[]> = {};
    
    if (doctorIds.length > 0) {
      // Use Drizzle ORM to query availability
      const availabilityResults = await db
        .select({
          doctorId: doctorAvailability.doctorId,
          slotId: doctorAvailability.id,
          startTime: doctorAvailability.startTime,
          endTime: doctorAvailability.endTime,
          slotDate: doctorAvailability.slotDate,
        })
        .from(doctorAvailability)
        .where(
          and(
            eq(doctorAvailability.slotDate, targetDate),
            eq(doctorAvailability.status, 'available'),
            inArray(doctorAvailability.doctorId, doctorIds),
            or(
              isNull(doctorAvailability.bookedByHospitalId),
              ne(doctorAvailability.bookedByHospitalId, hospitalId)
            )
          )
        )
        .orderBy(doctorAvailability.doctorId, asc(doctorAvailability.startTime));
      
      availabilityResults.forEach((row: any) => {
        const doctorId = row.doctorId;
        if (!availabilityByDoctor[doctorId]) {
          availabilityByDoctor[doctorId] = [];
        }
        availabilityByDoctor[doctorId].push({
          id: row.slotId,
          startTime: row.startTime,
          endTime: row.endTime,
          slotDate: row.slotDate,
        });
      });
    }

    // Format the results
    const formattedDoctorsList = doctorsList.rows.map((row: any) => ({
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      yearsOfExperience: row.yearsOfExperience,
      averageRating: row.averageRating,
      totalRatings: row.totalRatings,
      completedAssignments: row.completedAssignments,
      specialties: row.specialties || [],
      availableSlots: availabilityByDoctor[row.id] || [],
    }));

    // Format doctors with tier and requiredPlan mapping
    // Since schema doesn't have these fields, we'll derive them from rating and experience
    const formattedDoctors = formattedDoctorsList.map((doctor) => {
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

      // Format time slots with IDs
      const slots = (doctor.availableSlots || []).map((slot: any) => {
        if (!slot || !slot.startTime) return null;
        // Convert time format (HH:MM:SS) to readable format
        const timeStr = typeof slot.startTime === 'string' ? slot.startTime : slot.startTime.toString();
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const formattedTime = `${displayHour}:${minutes} ${ampm}`;
        
        return {
          id: slot.id,
          time: formattedTime,
          startTime: slot.startTime,
          endTime: slot.endTime,
          slotDate: slot.slotDate,
        };
      }).filter(Boolean);

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
        availableSlots: slots.length > 0 ? slots : [], // Return empty array if no slots
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

