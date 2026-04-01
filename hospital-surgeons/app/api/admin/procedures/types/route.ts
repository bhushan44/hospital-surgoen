import { NextResponse } from 'next/server';
import { ProceduresRepository } from '@/lib/repositories/procedures.repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const repository = new ProceduresRepository();
    const result = await repository.findProcedureTypes();
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching procedure types:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch procedure types' }, { status: 500 });
  }
}
