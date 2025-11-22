import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { users, auditLogs } from '@/src/db/drizzle/migrations/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const userId = params.id;
    const body = await req.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['active', 'inactive', 'pending', 'suspended'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Update user status
    const [updatedUser] = await db
      .update(users)
      .set({
        status: status,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId))
      .returning();

    // Create audit log
    await db.insert(auditLogs).values({
      userId: userId,
      actorType: 'admin',
      action: 'update_status',
      entityType: 'user',
      entityId: userId,
      details: {
        previousStatus: existingUser[0].status,
        newStatus: status,
        reason: body.reason || 'Status updated by admin',
      },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'User status updated successfully',
      data: {
        id: updatedUser.id,
        status: updatedUser.status,
      },
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update user status',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


