import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { DoctorsService } from '@/lib/services/doctors.service';
import { BookingsService } from '@/lib/services/bookings.service';
import { getDb } from '@/lib/db';
import { assignments, doctorHospitalAffiliations } from '@/src/db/drizzle/migrations/schema';
import { eq, and, sql, count } from 'drizzle-orm';

/**
 * @swagger
 * /api/doctors/dashboard:
 *   get:
 *     summary: Get doctor dashboard statistics and overview
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalAssignments:
 *                       type: number
 *                     pendingAssignments:
 *                       type: number
 *                     completedAssignments:
 *                       type: number
 *                     averageRating:
 *                       type: number
 *                     totalRatings:
 *                       type: number
 *                     totalEarnings:
 *                       type: number
 *                     thisMonthEarnings:
 *                       type: number
 *                     thisMonthAssignments:
 *                       type: number
 *                     upcomingSlots:
 *                       type: number
 *                     profileCompletion:
 *                       type: number
 *                       description: Profile completion percentage (0-100)
 *                     credentials:
 *                       type: object
 *                       properties:
 *                         verified:
 *                           type: number
 *                         pending:
 *                           type: number
 *                         rejected:
 *                           type: number
 *                     activeAffiliations:
 *                       type: number
 *                     licenseVerificationStatus:
 *                       type: string
 *                       enum: [pending, verified, rejected]
 *       404:
 *         description: Doctor profile not found
 *       500:
 *         description: Internal server error
 */
async function getHandler(req: NextRequest) {
  try {
    const user = (req as any).user;
    const doctorsService = new DoctorsService();
    const bookingsService = new BookingsService();
    
    // Get doctor profile
    const doctorResult = await doctorsService.findDoctorByUserId(user.userId);
    if (!doctorResult.success || !doctorResult.data) {
      return NextResponse.json(
        { success: false, message: 'Doctor profile not found' },
        { status: 404 }
      );
    }

    const doctor = doctorResult.data;
    const doctorId = doctor.id;

    // Get stats
    const statsResult = await doctorsService.getDoctorStats(doctorId);
    const stats = statsResult.success ? statsResult.data : null;

    // Get pending assignments count
    const pendingBookings = await bookingsService.findBookings({
      doctorId,
      status: 'pending',
      page: 1,
      limit: 10,
    });
    const pendingAssignments = pendingBookings.success && pendingBookings.data 
      ? (Array.isArray(pendingBookings.data) ? pendingBookings.data.length : 0)
      : 0;

    // Get today's assignments count
    const db = getDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    const todayAssignmentsResult = await db
      .select({ count: count() })
      .from(assignments)
      .where(
        and(
          eq(assignments.doctorId, doctorId),
          sql`DATE(${assignments.requestedAt}) = CURRENT_DATE`
        )
      );
    const todayAssignments = Number(todayAssignmentsResult[0]?.count || 0);

    // Get upcoming availability
    const availabilityResult = await doctorsService.getDoctorAvailability(doctorId);
    const availability = availabilityResult.success ? availabilityResult.data : [];
    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingSlots = Array.isArray(availability) 
      ? availability.filter((slot: any) => 
          slot.slotDate >= todayStr && slot.status === 'available'
        ).length
      : 0;

    // Get earnings (will be fetched separately by earnings endpoint)
    const totalEarnings = 0;
    const thisMonthEarnings = 0;
    const thisMonthAssignments = 0;

    // Get credentials count
    const credentialsResult = await doctorsService.getDoctorCredentials(doctorId);
    const credentials = credentialsResult.success && credentialsResult.data ? credentialsResult.data : [];
    const credentialsStats = {
      verified: Array.isArray(credentials) ? credentials.filter((c: any) => c.verificationStatus === 'verified').length : 0,
      pending: Array.isArray(credentials) ? credentials.filter((c: any) => c.verificationStatus === 'pending').length : 0,
      rejected: Array.isArray(credentials) ? credentials.filter((c: any) => c.verificationStatus === 'rejected').length : 0,
    };

    // Get active affiliations count
    const activeAffiliationsResult = await db
      .select({ count: count() })
      .from(doctorHospitalAffiliations)
      .where(
        and(
          eq(doctorHospitalAffiliations.doctorId, doctorId),
          eq(doctorHospitalAffiliations.status, 'active')
        )
      );
    const activeAffiliations = Number(activeAffiliationsResult[0]?.count || 0);
    
    // Get max affiliations limit from subscription (if available)
    // This would require fetching the doctor's subscription and plan features
    // For now, we'll just return the count and let the frontend handle the limit display

    // Calculate profile completion
    let profileScore = 0;
    if (doctor.firstName && doctor.lastName) profileScore += 20;
    if (doctor.medicalLicenseNumber) profileScore += 15;
    if (doctor.yearsOfExperience) profileScore += 10;
    if (doctor.bio) profileScore += 15;
    // Check for location - either primaryLocation OR address components (fullAddress/city/state)
    if (doctor.primaryLocation || (doctor.fullAddress && doctor.city && doctor.state)) profileScore += 10;
    if (doctor.profilePhotoId) profileScore += 10;
    if (doctor.licenseVerificationStatus === 'verified') profileScore += 20;
    const profileCompletion = Math.min(profileScore, 100);

    return NextResponse.json({
      success: true,
      data: {
        totalAssignments: stats?.totalBookings || doctor.completedAssignments || 0,
        pendingAssignments,
        completedAssignments: stats?.totalBookings || doctor.completedAssignments || 0,
        averageRating: Number(doctor.averageRating || 0),
        totalRatings: doctor.totalRatings || 0,
        totalEarnings,
        thisMonthEarnings,
        thisMonthAssignments,
        upcomingSlots,
        profileCompletion,
        credentials: credentialsStats,
        activeAffiliations,
        todayAssignments,
        licenseVerificationStatus: doctor.licenseVerificationStatus,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);

