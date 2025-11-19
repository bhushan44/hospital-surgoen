import { NextRequest, NextResponse } from 'next/server';
import { DoctorsService } from '@/lib/services/doctors.service';
import { withAuth } from '@/lib/auth/middleware';

/**
 * @swagger
 * /api/doctors/profile:
 *   get:
 *     summary: Get current doctor profile
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor profile retrieved successfully
 *       404:
 *         description: Doctor profile not found
 *   post:
 *     summary: Create doctor profile for authenticated user
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - medicalLicenseNumber
 *             properties:
 *               medicalLicenseNumber:
 *                 type: string
 *               yearsOfExperience:
 *                 type: number
 *               bio:
 *                 type: string
 *               profilePhotoId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Doctor profile created successfully
 *       400:
 *         description: Bad request or profile already exists
 */
async function getHandler(req: NextRequest) {
  try {
    const user = (req as any).user;
    const doctorsService = new DoctorsService();
    const result = await doctorsService.findDoctorByUserId(user.userId);
    
    return NextResponse.json(result, { status: result.success ? 200 : 404 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

async function postHandler(req: NextRequest) {
  try {
    const user = (req as any).user;
    const body = await req.json();
    const doctorsService = new DoctorsService();
    
    const result = await doctorsService.createDoctorProfile(user.userId, {
      medicalLicenseNumber: body.medicalLicenseNumber,
      yearsOfExperience: body.yearsOfExperience,
      bio: body.bio,
      profilePhotoId: body.profilePhotoId,
      firstName: body.firstName, // Optional, from step 2
      lastName: body.lastName, // Optional, from step 2
    } as any);
    
    return NextResponse.json(result, { status: result.success ? 201 : 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);


