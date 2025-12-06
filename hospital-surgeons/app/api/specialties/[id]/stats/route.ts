import { NextRequest, NextResponse } from 'next/server';
import { SpecialtiesService } from '@/lib/services/specialties.service';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const specialtiesService = new SpecialtiesService();
    const result = await specialtiesService.getSpecialtyStats(params.id);
    
    return NextResponse.json(result, { status: result.success ? 200 : 404 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}











