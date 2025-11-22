import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { supportTickets, users, auditLogs } from '@/src/db/drizzle/migrations/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const ticketId = params.id;
    const body = await req.json();
    const { assignedTo } = body;

    if (!assignedTo) {
      return NextResponse.json(
        { success: false, message: 'Assigned to user ID is required' },
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

    // Check if assigned user exists and is admin
    const assignedUser = await db
      .select()
      .from(users)
      .where(eq(users.id, assignedTo))
      .limit(1);

    if (assignedUser.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Assigned user not found' },
        { status: 404 }
      );
    }

    // Update ticket
    const [updatedTicket] = await db
      .update(supportTickets)
      .set({ assignedTo })
      .where(eq(supportTickets.id, ticketId))
      .returning();

    // Create audit log
    await db.insert(auditLogs).values({
      actorType: 'admin',
      action: 'assign',
      entityType: 'support_ticket',
      entityId: ticketId,
      details: {
        assignedTo,
        previousAssignedTo: existing[0].assignedTo,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Ticket assigned successfully',
      data: updatedTicket,
    });
  } catch (error) {
    console.error('Error assigning ticket:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to assign ticket',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


