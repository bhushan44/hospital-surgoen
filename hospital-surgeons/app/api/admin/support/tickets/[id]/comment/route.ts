import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { supportTickets, auditLogs } from '@/src/db/drizzle/migrations/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    const ticketId = id;
    const body = await req.json();
    const { comment, userId } = body;

    if (!comment) {
      return NextResponse.json(
        { success: false, message: 'Comment is required' },
        { status: 400 }
      );
    }

    // Check if ticket exists
    const existing = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.id, ticketId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Support ticket not found' },
        { status: 404 }
      );
    }

    // Create audit log as comment
    await db.insert(auditLogs).values({
      userId: userId || null,
      actorType: userId ? 'user' : 'admin',
      action: 'comment',
      entityType: 'support_ticket',
      entityId: ticketId,
      details: {
        comment,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Comment added successfully',
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to add comment',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


