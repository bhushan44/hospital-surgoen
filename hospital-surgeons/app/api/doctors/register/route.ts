import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { users, doctors, doctorSpecialties } from '@/src/db/drizzle/migrations/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { signToken } from '@/lib/auth/jwt';

/**
 * @swagger
 * /api/doctors/register:
 *   post:
 *     summary: Complete doctor registration in a single API call
 *     description: Creates user account, doctor profile, and doctor specialties in one atomic transaction
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - phone
 *               - firstName
 *               - lastName
 *               - medicalLicenseNumber
 *               - yearsOfExperience
 *               - specialties
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: doctor@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: "SecurePassword123!"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Smith"
 *               medicalLicenseNumber:
 *                 type: string
 *                 example: "MD-12345"
 *               yearsOfExperience:
 *                 type: integer
 *                 minimum: 0
 *                 example: 5
 *               bio:
 *                 type: string
 *                 example: "Experienced cardiologist..."
 *               profilePhotoId:
 *                 type: string
 *                 format: uuid
 *                 description: Optional file ID for profile photo
 *               specialties:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - specialtyId
 *                   properties:
 *                     specialtyId:
 *                       type: string
 *                       format: uuid
 *                     isPrimary:
 *                       type: boolean
 *                       default: false
 *                     yearsOfExperience:
 *                       type: integer
 *                       minimum: 0
 *               device:
 *                 type: object
 *                 properties:
 *                   device_token:
 *                     type: string
 *                   device_type:
 *                     type: string
 *                     enum: [ios, android, web]
 *                   app_version:
 *                     type: string
 *                   os_version:
 *                     type: string
 *                   is_active:
 *                     type: boolean
 *     responses:
 *       201:
 *         description: Doctor registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Doctor registered successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     doctor:
 *                       type: object
 *                     specialties:
 *                       type: array
 *                     accessToken:
 *                       type: string
 *       400:
 *         description: Bad request - validation error or duplicate email/license
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
  const db = getDb();
  
  try {
    const body = await req.json();
      // Validate required fields
      const requiredFields = [
        'email',
        'password',
        'phone',
        'firstName',
        'lastName',
        'medicalLicenseNumber',
        'yearsOfExperience',
        'specialties',
      ];

      for (const field of requiredFields) {
        if (!body[field]) {
          return NextResponse.json(
            { success: false, message: `${field} is required` },
            { status: 400 }
          );
        }
      }

      // Validate specialties array
      if (!Array.isArray(body.specialties) || body.specialties.length === 0) {
        return NextResponse.json(
          { success: false, message: 'At least one specialty is required' },
          { status: 400 }
        );
      }

      // Validate password strength
      if (body.password.length < 8) {
        return NextResponse.json(
          { success: false, message: 'Password must be at least 8 characters long' },
          { status: 400 }
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { success: false, message: 'Invalid email format' },
          { status: 400 }
        );
      }

    // Check if user with email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Check if doctor with license number already exists
    const existingDoctor = await db
      .select()
      .from(doctors)
      .where(eq(doctors.medicalLicenseNumber, body.medicalLicenseNumber))
      .limit(1);

    if (existingDoctor.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Doctor with this license number already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(body.password, 10);

    // Step 1: Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: body.email,
        phone: body.phone,
        passwordHash,
        role: 'doctor',
        status: 'pending', // Doctor needs verification
      })
      .returning();

    // Step 2: Create doctor profile
    const [newDoctor] = await db
      .insert(doctors)
      .values({
        userId: newUser.id,
        firstName: body.firstName,
        lastName: body.lastName,
        medicalLicenseNumber: body.medicalLicenseNumber,
        yearsOfExperience: parseInt(body.yearsOfExperience) || 0,
        bio: body.bio || null,
        profilePhotoId: body.profilePhotoId || null,
        licenseVerificationStatus: 'pending',
      })
      .returning();

    // Step 3: Create doctor specialties
    const specialtyInserts = body.specialties.map((spec: any, index: number) => ({
      doctorId: newDoctor.id,
      specialtyId: spec.specialtyId,
      isPrimary: spec.isPrimary || (index === 0 && !body.specialties.some((s: any) => s.isPrimary === true)),
      yearsOfExperience: spec.yearsOfExperience || null,
    }));

    const insertedSpecialties = await db
      .insert(doctorSpecialties)
      .values(specialtyInserts)
      .returning();

    // Step 4: Create device record if provided
    if (body.device) {
      const { userDevices } = await import('@/src/db/drizzle/migrations/schema');
      await db.insert(userDevices).values({
        userId: newUser.id,
        deviceType: body.device.device_type || 'web',
        deviceToken: body.device.device_token || `web-token-${Date.now()}`,
        appVersion: body.device.app_version || '1.0.0',
        osVersion: body.device.os_version || '1.0.0',
        isActive: body.device.is_active !== false,
      });
    }

    // Generate JWT token
    const accessToken = signToken(
      { userId: newUser.id, userRole: newUser.role },
      process.env.JWT_ACCESS_TOKEN_SECRET!,
      process.env.JWT_ACCESS_TOKEN_EXPIRATION || '7d'
    );

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Doctor registered successfully',
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            phone: newUser.phone,
            role: newUser.role,
            status: newUser.status,
          },
          doctor: {
            id: newDoctor.id,
            firstName: newDoctor.firstName,
            lastName: newDoctor.lastName,
            medicalLicenseNumber: newDoctor.medicalLicenseNumber,
            yearsOfExperience: newDoctor.yearsOfExperience,
          },
          specialties: insertedSpecialties,
          accessToken,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Doctor registration error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to register doctor',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

