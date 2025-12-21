import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { doctors, doctorSpecialties, specialties, doctorAvailability, hospitals, subscriptions, subscriptionPlans, users, doctorPlanFeatures, hospitalPlanFeatures } from '@/src/db/drizzle/migrations/schema';
import { eq, and, or, sql, desc, asc, gte, inArray, isNull, ne } from 'drizzle-orm';
import { calculateDoctorScore, sortDoctorsByScore, type DoctorScoringData } from '@/lib/utils/doctor-scoring';

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
    // Support multiple specialty IDs
    const specialtyIds = searchParams.getAll('specialtyId'); // Gets all values for 'specialtyId'
    const date = searchParams.get('date') || undefined;
    const priority = searchParams.get('priority') || 'routine';
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10); // Default 20 per page
    const offset = (page - 1) * limit;

    // Get hospital's subscription tier and premium doctor access
    const hospitalResult = await db
      .select({
        userId: hospitals.userId,
      })
      .from(hospitals)
      .where(eq(hospitals.id, hospitalId))
      .limit(1);

    let hospitalSubscriptionTier: 'free' | 'gold' | 'premium' = 'free';
    let includesPremiumDoctors = false;
    
    if (hospitalResult[0]?.userId) {
      const subscriptionResult = await db
        .select({
          tier: subscriptionPlans.tier,
          planId: subscriptionPlans.id,
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

        // Check if hospital has premium doctor access
        const hospitalFeatures = await db
          .select({
            includesPremiumDoctors: hospitalPlanFeatures.includesPremiumDoctors,
          })
          .from(hospitalPlanFeatures)
          .where(eq(hospitalPlanFeatures.planId, subscriptionResult[0].planId))
          .limit(1);

        if (hospitalFeatures.length > 0) {
          includesPremiumDoctors = hospitalFeatures[0].includesPremiumDoctors || false;
        }
      }
    }

    // Build WHERE conditions dynamically using Drizzle's sql template
    const whereConditions: any[] = [];

    // Only show verified doctors
    whereConditions.push(sql`d.license_verification_status = 'verified'`);

    // Search text condition - improved to search first name, last name, full name, and specialty
    if (searchText) {
      const searchPattern = `%${searchText.toLowerCase()}%`;
      whereConditions.push(sql`(
        LOWER(d.first_name) LIKE ${searchPattern} OR
        LOWER(d.last_name) LIKE ${searchPattern} OR
        LOWER(d.first_name || ' ' || d.last_name) LIKE ${searchPattern} OR
        LOWER(d.last_name || ' ' || d.first_name) LIKE ${searchPattern} OR
        EXISTS (
          SELECT 1 FROM doctor_specialties ds
          INNER JOIN specialties s ON ds.specialty_id = s.id
          WHERE ds.doctor_id = d.id AND LOWER(s.name) LIKE ${searchPattern}
        )
      )`);
    }

    // Multiple specialty IDs condition - use proper SQL array syntax
    if (specialtyIds.length > 0) {
      // Use EXISTS with ANY clause for multiple specialty IDs
      // Build array literal properly: ARRAY['uuid1'::uuid, 'uuid2'::uuid]
      const specialtyArrayLiteral = `ARRAY[${specialtyIds.map(id => `'${id}'::uuid`).join(', ')}]`;
      whereConditions.push(sql.raw(`EXISTS (
        SELECT 1 FROM doctor_specialties 
        WHERE doctor_id = d.id 
        AND specialty_id = ANY(${specialtyArrayLiteral})
      )`));
    }

    // Build WHERE clause - combine conditions manually
    let whereClause: any = sql``;
    if (whereConditions.length > 0) {
      if (whereConditions.length === 1) {
        whereClause = sql`WHERE ${whereConditions[0]}`;
      } else {
        // Combine multiple conditions with AND
        let combined = whereConditions[0];
        for (let i = 1; i < whereConditions.length; i++) {
          combined = sql`${combined} AND ${whereConditions[i]}`;
        }
        whereClause = sql`WHERE ${combined}`;
      }
    }

    // Count query for pagination
    const countQuery = sql`
      SELECT COUNT(DISTINCT d.id) as total
      FROM doctors d
      ${whereClause}
    `;

    // Main query with pagination
    const doctorQuery = sql`
      SELECT 
        d.id,
        d.first_name as "firstName",
        d.last_name as "lastName",
        d.years_of_experience as "yearsOfExperience",
        d.average_rating as "averageRating",
        d.total_ratings as "totalRatings",
        d.completed_assignments as "completedAssignments",
        d.license_verification_status as "licenseVerificationStatus",
        ARRAY(
          SELECT s.name 
          FROM specialties s 
          INNER JOIN doctor_specialties ds ON s.id = ds.specialty_id 
          WHERE ds.doctor_id = d.id
        ) as specialties
      FROM doctors d
      ${whereClause}
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    
    // Execute count query for pagination
    const countResult = await db.execute(countQuery);
    const totalCount = parseInt(String(countResult.rows[0]?.total || '0'), 10);
    const totalPages = Math.ceil(totalCount / limit);
    
    // Execute main query
    const doctorsList = await db.execute(doctorQuery);
    
    // Get list of doctor IDs from the results
    const doctorIds = doctorsList.rows.map((row: any) => row.id);
    
    // Fetch parent slots for each doctor for the specified date
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Group parent slots by doctor ID (only parent slots, parentSlotId IS NULL)
    const availabilityByDoctor: Record<string, any[]> = {};
    
    if (doctorIds.length > 0) {
      // Query parent slots only (parentSlotId IS NULL)
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
            isNull(doctorAvailability.parentSlotId), // Only parent slots
            inArray(doctorAvailability.doctorId, doctorIds)
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

    // Get doctor user IDs by querying doctors table
    const doctorUserIdsMap: Record<string, string> = {};
    if (doctorIds.length > 0) {
      const doctorUsers = await db
        .select({
          id: doctors.id,
          userId: doctors.userId,
        })
        .from(doctors)
        .where(inArray(doctors.id, doctorIds));
      
      doctorUsers.forEach((doc) => {
        doctorUserIdsMap[doc.id] = doc.userId;
      });
    }
    
    // Fetch active subscriptions for all doctors
    const doctorUserIdsList = Object.values(doctorUserIdsMap);
    const doctorSubscriptions = doctorUserIdsList.length > 0 ? await db
      .select({
        userId: subscriptions.userId,
        tier: subscriptionPlans.tier,
        planId: subscriptionPlans.id,
      })
      .from(subscriptions)
      .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(
        and(
          inArray(subscriptions.userId, doctorUserIdsList),
          eq(subscriptions.status, 'active'),
          eq(subscriptionPlans.userRole, 'doctor')
        )
      ) : [];
    
    // Create a map of userId -> subscription tier
    const subscriptionMap: Record<string, { tier: string; planId: string }> = {};
    doctorSubscriptions.forEach((sub) => {
      subscriptionMap[sub.userId] = { tier: sub.tier, planId: sub.planId };
    });
    
    // Fetch visibility weights for doctor plans
    const planIds = [...new Set(doctorSubscriptions.map(s => s.planId))];
    const visibilityWeights = planIds.length > 0 ? await db
      .select({
        planId: doctorPlanFeatures.planId,
        visibilityWeight: doctorPlanFeatures.visibilityWeight,
      })
      .from(doctorPlanFeatures)
      .where(inArray(doctorPlanFeatures.planId, planIds)) : [];
    
    const visibilityWeightMap: Record<string, number> = {};
    visibilityWeights.forEach((vw) => {
      visibilityWeightMap[vw.planId] = vw.visibilityWeight || 1;
    });
    
    // Format the results and calculate scores
    const formattedDoctorsList = doctorsList.rows.map((row: any) => {
      const userId = doctorUserIdsMap[row.id];
      const subscription = userId ? subscriptionMap[userId] : null;
      const visibilityWeight = subscription?.planId ? visibilityWeightMap[subscription.planId] : null;
      
      // Calculate score
      const scoringData: DoctorScoringData = {
        yearsOfExperience: row.yearsOfExperience || 0,
        averageRating: row.averageRating ? Number(row.averageRating) : null,
        totalRatings: row.totalRatings || 0,
        completedAssignments: row.completedAssignments || 0,
        licenseVerificationStatus: (row.licenseVerificationStatus || 'pending') as 'pending' | 'verified' | 'rejected',
        subscriptionTier: subscription?.tier as any || null,
        visibilityWeight: visibilityWeight || null,
      };
      
      const score = calculateDoctorScore(scoringData);
      
      return {
        id: row.id,
        firstName: row.firstName,
        lastName: row.lastName,
        yearsOfExperience: row.yearsOfExperience,
        averageRating: row.averageRating,
        totalRatings: row.totalRatings,
        completedAssignments: row.completedAssignments,
        licenseVerificationStatus: row.licenseVerificationStatus,
        specialties: row.specialties || [],
        availableSlots: availabilityByDoctor[row.id] || [],
        score, // Include score for sorting
      };
    });

    // Sort doctors by score (highest first)
    const sortedDoctors = sortDoctorsByScore(formattedDoctorsList);
    
    // Format doctors with tier and requiredPlan mapping
    // Since schema doesn't have these fields, we'll derive them from rating and experience
    const formattedDoctors = sortedDoctors.map((doctor) => {
      const rating = doctor.averageRating ? Number(doctor.averageRating) : 0;
      const experience = doctor.yearsOfExperience || 0;
      const completed = doctor.completedAssignments || 0;

      // Derive tier based on score and other factors
      let tier: 'platinum' | 'gold' | 'silver' = 'silver';
      let requiredPlan: 'free' | 'gold' | 'premium' = 'free';
      
      const totalScore = doctor.score?.totalScore || 0;

      // Tier determination based on score and key metrics
      if (totalScore >= 80 || (rating >= 4.8 && experience >= 15 && completed >= 400)) {
        tier = 'platinum';
        requiredPlan = 'premium';
      } else if (totalScore >= 60 || (rating >= 4.6 && experience >= 10 && completed >= 200)) {
        tier = 'gold';
        requiredPlan = 'gold';
      } else {
        tier = 'silver';
        requiredPlan = 'free';
      }

      // Format parent slots - these are the main availability windows
      // The UI will fetch detailed availability (with booked sub-slots) when user selects a slot
      const slots = (doctor.availableSlots || []).map((slot: any) => {
        if (!slot || !slot.startTime) return null;
        // Convert time format (HH:MM:SS) to readable format for display
        const timeStr = typeof slot.startTime === 'string' ? slot.startTime : slot.startTime.toString();
        const [startHours, startMinutes] = timeStr.split(':');
        const startHour = parseInt(startHours);
        const startAmpm = startHour >= 12 ? 'PM' : 'AM';
        const startDisplayHour = startHour > 12 ? startHour - 12 : startHour === 0 ? 12 : startHour;
        
        const endTimeStr = typeof slot.endTime === 'string' ? slot.endTime : slot.endTime.toString();
        const [endHours, endMinutes] = endTimeStr.split(':');
        const endHour = parseInt(endHours);
        const endAmpm = endHour >= 12 ? 'PM' : 'AM';
        const endDisplayHour = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour;
        
        const formattedTime = `${startDisplayHour}:${startMinutes} ${startAmpm} - ${endDisplayHour}:${endMinutes} ${endAmpm}`;
        
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
        score: doctor.score?.totalScore || 0, // Include score in response for debugging/display
        scoreBreakdown: doctor.score?.breakdown, // Include breakdown for transparency
      };
    });

    // Filter doctors based on subscription access and premium doctor access
    const accessibleDoctors = formattedDoctors.filter((doctor) => {
      const planHierarchy = { free: 0, gold: 1, premium: 2 };
      const doctorRequired = planHierarchy[doctor.requiredPlan as keyof typeof planHierarchy];
      const hospitalHas = planHierarchy[hospitalSubscriptionTier];
      
      // Check if doctor is premium (platinum tier or premium plan)
      const isPremiumDoctor = doctor.tier === 'platinum' || doctor.requiredPlan === 'premium';
      
      // If doctor is premium and hospital doesn't have premium access, filter out
      if (isPremiumDoctor && !includesPremiumDoctors) {
        return false;
      }
      
      // Otherwise, check plan hierarchy
      return hospitalHas >= doctorRequired;
    });

    // Sort: accessible first, then by score (already sorted by score, but re-sort to prioritize accessible)
    accessibleDoctors.sort((a, b) => {
      const aAccessible = planHierarchy[hospitalSubscriptionTier] >= planHierarchy[a.requiredPlan as keyof typeof planHierarchy];
      const bAccessible = planHierarchy[hospitalSubscriptionTier] >= planHierarchy[b.requiredPlan as keyof typeof planHierarchy];
      if (aAccessible !== bAccessible) return bAccessible ? 1 : -1;
      
      // If both accessible or both not accessible, sort by score (higher first)
      const scoreA = a.score || 0;
      const scoreB = b.score || 0;
      return scoreB - scoreA;
    });

    return NextResponse.json({
      success: true,
      data: {
        doctors: accessibleDoctors,
        hospitalSubscription: hospitalSubscriptionTier,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
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

