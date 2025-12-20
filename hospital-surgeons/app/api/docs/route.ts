import { NextResponse } from 'next/server';
import { swaggerSpec } from '@/lib/swagger/config';

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Get Swagger API documentation
 *     tags: [Documentation]
 *     responses:
 *       200:
 *         description: Swagger JSON specification
 */
export async function GET() {
  return NextResponse.json(swaggerSpec);
}


























