import { NextRequest, NextResponse } from 'next/server';
import { UsersService } from '@/lib/services/users.service';

/**
 * @swagger
 * /api/users/reset-password-otp:
 *   post:
 *     summary: Reset password using OTP code
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - otpCode
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 description: Password reset token from email link
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               otpCode:
 *                 type: string
 *                 description: 6-digit OTP code received via email
 *                 example: "123456"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: New password (minimum 8 characters)
 *                 example: "NewSecurePassword123!"
 *     responses:
 *       200:
 *         description: Password reset successfully
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
 *                   example: "Password has been reset successfully"
 *       400:
 *         description: Bad request (invalid OTP, expired OTP, or weak password)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid or expired OTP. Please request a new password reset code."
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, otpCode, password } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'Reset token is required',
        },
        { status: 400 }
      );
    }

    if (!otpCode || typeof otpCode !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'OTP code is required',
        },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'Password is required',
        },
        { status: 400 }
      );
    }

    const usersService = new UsersService();
    const result = await usersService.resetPasswordWithTokenAndOtp(token, otpCode, password);

    // Return 400 for OTP errors, 500 for server errors, 200 for success
    const statusCode = result.success ? 200 : 
                      (result.message?.includes('expired') || 
                       result.message?.includes('Invalid') || 
                       result.message?.includes('must be at least') ||
                       result.message?.includes('not found')) ? 400 : 500;

    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('Error in reset-password-otp route:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

