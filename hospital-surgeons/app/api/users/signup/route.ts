import { NextRequest, NextResponse } from 'next/server';
import { UsersService } from '@/lib/services/users.service';

/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: Register a new user (doctor)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - phone
 *               - password
 *               - device
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: doctor@example.com
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SecurePassword123!"
 *               device:
 *                 type: object
 *                 required:
 *                   - device_token
 *                   - device_type
 *                 properties:
 *                   device_token:
 *                     type: string
 *                     example: "device-token-123"
 *                   device_type:
 *                     type: string
 *                     enum: [ios, android, web]
 *                     example: "web"
 *                   app_version:
 *                     type: string
 *                     example: "1.0.0"
 *                   os_version:
 *                     type: string
 *                     example: "1.0.0"
 *                   is_active:
 *                     type: boolean
 *                     example: true
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                   example: "User created successfully"
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }
    
    if (!body.password || body.password.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Password is required and cannot be empty' },
        { status: 400 }
      );
    }
    
    if (!body.phone) {
      return NextResponse.json(
        { success: false, message: 'Phone is required' },
        { status: 400 }
      );
    }
    
    const usersService = new UsersService();
    
    // Convert password to password_hash for the service
    // The service will hash it, so we pass the plain password here
    const createUserDto = {
      email: body.email,
      phone: body.phone,
      password_hash: body.password, // Plain password - will be hashed in the service
      firstName: body.firstName,
      lastName: body.lastName,
      device: body.device || {
        device_token: 'web-token-' + Date.now(),
        device_type: 'web',
        app_version: '1.0.0',
        os_version: '1.0.0',
        is_active: true,
      },
    };
    
    const result = await usersService.create(createUserDto, 'doctor');
    
    // Generate tokens for the response
    if (result.success && result.data && result.data[0]) {
      const { signToken } = await import('@/lib/auth/jwt');
      const payload = { userId: result.data[0].id, userRole: result.data[0].role };
      const accessToken = signToken(
        payload,
        process.env.JWT_ACCESS_TOKEN_SECRET!,
        process.env.JWT_ACCESS_TOKEN_EXPIRATION || '900s'
      );
      
      return NextResponse.json({
        ...result,
        data: {
          accessToken,
          user: result.data[0],
        },
      }, { status: 201 });
    }
    
    return NextResponse.json(result, { status: result.success ? 201 : 400 });
  } catch (error) {
    console.error('Signup error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error', 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

