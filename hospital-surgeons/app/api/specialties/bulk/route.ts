import { NextRequest, NextResponse } from 'next/server';
import { SpecialtiesService } from '@/lib/services/specialties.service';
import { withAuth } from '@/lib/auth/middleware';

async function handler(req: NextRequest) {
  try {
    const body = await req.json();
    const specialtiesService = new SpecialtiesService();
    const result = await specialtiesService.createBulkSpecialties(body);
    
    return NextResponse.json(result, { status: result.success ? 201 : 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler, ['admin']);









