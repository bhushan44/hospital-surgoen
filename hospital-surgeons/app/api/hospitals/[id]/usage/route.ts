import { NextRequest, NextResponse } from 'next/server';
import { HospitalUsageService } from '@/lib/services/hospital-usage.service';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const hospitalId = params.id;
    
    const hospitalUsageService = new HospitalUsageService();
    const usage = await hospitalUsageService.getUsage(hospitalId);

    return NextResponse.json({
      success: true,
      data: usage,
    });
  } catch (error) {
    console.error('Error fetching hospital usage:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch usage', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

