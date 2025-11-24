import { NextResponse } from 'next/server';
import { generateAvailabilityFromTemplates } from '@/lib/jobs/generateAvailabilityFromTemplates';
import { withAuthAndContext, AuthenticatedRequest } from '@/lib/auth/middleware';

async function postHandler(
  _req: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const summary = await generateAvailabilityFromTemplates({ doctorIds: [params.id] });
    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to generate slots', error: String(error) },
      { status: 500 }
    );
  }
}

export const POST = withAuthAndContext(postHandler, ['doctor', 'admin']);

