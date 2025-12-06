import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { users, hospitals, hospitalDepartments, userDevices } from '@/src/db/drizzle/migrations/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { signToken } from '@/lib/auth/jwt';

/**
 * @swagger
 * /api/hospitals/register:
 *   post:
 *     summary: Complete hospital registration in a single API call
 *     description: Creates user account, hospital profile, and hospital departments in one atomic transaction
 *     tags: [Hospitals]
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
 *               - name
 *               - registrationNumber
 *               - address
 *               - city
 *               - departments
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: hospital@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: "SecurePassword123!"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               name:
 *                 type: string
 *                 example: "City General Hospital"
 *               registrationNumber:
 *                 type: string
 *                 example: "HOSP-12345"
 *               address:
 *                 type: string
 *                 example: "123 Main Street"
 *               city:
 *                 type: string
 *                 example: "New York"
 *               hospitalType:
 *                 type: string
 *                 enum: [general, specialty, clinic, trauma_center, teaching, other]
 *               numberOfBeds:
 *                 type: integer
 *                 minimum: 0
 *                 example: 100
 *               contactEmail:
 *                 type: string
 *                 format: email
 *               contactPhone:
 *                 type: string
 *               websiteUrl:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               departments:
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
 *         description: Hospital registered successfully
 *       400:
 *         description: Bad request - validation error or duplicate email/registration number
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
  const db = getDb();
  
  try {
    // Validate request body with Zod
    const { HospitalRegisterDtoSchema } = await import('@/lib/validations/hospital.dto');
    const { validateRequest } = await import('@/lib/utils/validate-request');
    
    const validation = await validateRequest(req, HospitalRegisterDtoSchema);
    if (!validation.success) {
      return validation.response;
    }

    const body = validation.data;

    // Check if user with email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Check if hospital with registration number already exists
    const existingHospital = await db
      .select()
      .from(hospitals)
      .where(eq(hospitals.registrationNumber, body.registrationNumber))
      .limit(1);

    if (existingHospital.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Hospital with this registration number already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(body.password, 10);

    let newUser;
    let newHospital;
    let insertedDepartments;

    // Use transaction to ensure atomicity
    await db.transaction(async (tx) => {
      // Step 1: Create user
      [newUser] = await tx
        .insert(users)
        .values({
          email: body.email,
          phone: body.phone,
          passwordHash,
          role: 'hospital',
          status: 'pending', // Hospital needs verification
        })
        .returning();

      if (!newUser) {
        throw new Error('Failed to create user');
      }

      // Step 2: Create hospital profile
      [newHospital] = await tx
        .insert(hospitals)
        .values({
          userId: newUser.id,
          name: body.name,
          registrationNumber: body.registrationNumber,
          address: body.address,
          city: body.city,
          hospitalType: body.hospitalType || null,
          numberOfBeds: body.numberOfBeds ?? null,
          contactEmail: body.contactEmail || body.email,
          contactPhone: body.contactPhone || body.phone,
          websiteUrl: body.websiteUrl || null,
          latitude: body.latitude ? String(body.latitude) : null,
          longitude: body.longitude ? String(body.longitude) : null,
          licenseVerificationStatus: 'pending',
        })
        .returning();

      if (!newHospital) {
        throw new Error('Failed to create hospital profile');
      }

      // Step 3: Create hospital departments
      const departmentInserts = body.departments.map((dept: { specialtyId: string }) => ({
        hospitalId: newHospital!.id,
        specialtyId: dept.specialtyId,
      }));

      insertedDepartments = await tx
        .insert(hospitalDepartments)
        .values(departmentInserts)
        .returning();

      // Step 4: Create device record if provided
      if (body.device) {
        await tx.insert(userDevices).values({
          userId: newUser.id,
          deviceType: body.device.device_type || 'web',
          deviceToken: body.device.device_token || `web-token-${Date.now()}`,
          appVersion: body.device.app_version || '1.0.0',
          osVersion: body.device.os_version || '1.0.0',
          isActive: body.device.is_active !== false,
        });
      }
    });

    // Generate JWT token
    const accessToken = signToken(
      { userId: newUser!.id, userRole: newUser!.role },
      process.env.JWT_ACCESS_TOKEN_SECRET!,
      process.env.JWT_ACCESS_TOKEN_EXPIRATION || '7d'
    );

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Hospital registered successfully and awaiting verification',
        data: {
          user: {
            id: newUser!.id,
            email: newUser!.email,
            phone: newUser!.phone,
            role: newUser!.role,
            status: newUser!.status,
          },
          hospital: {
            id: newHospital!.id,
            name: newHospital!.name,
            registrationNumber: newHospital!.registrationNumber,
            city: newHospital!.city,
          },
          departments: insertedDepartments,
          accessToken,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Hospital registration error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to register hospital',
        error: error instanceof Error ? error.message : String(error),
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}



