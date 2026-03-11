import { NextResponse } from 'next/server';
import { withAuthAndContext, AuthenticatedRequest } from '@/lib/auth/middleware';
import { ChatService } from '@/lib/services/chat.service';

const chatService = new ChatService();

type Params = { params: Promise<{ conversationId: string; messageId: string }> };

/**
 * PATCH /api/chats/[conversationId]/messages/[messageId]/read
 * Mark a message as read and reset conversation unread count for the reader.
 */
export const PATCH = withAuthAndContext<Params>(
  async (req: AuthenticatedRequest, context) => {
    try {
      const { conversationId, messageId } = await context.params;
      const { userId, userRole } = req.user!;

      const message = await chatService.markMessageAsRead(conversationId, messageId, userId, userRole);
      return NextResponse.json({ success: true, data: message });
    } catch (error: any) {
      const status = error.statusCode || 500;
      if (status < 500) return NextResponse.json({ success: false, message: error.message }, { status });
      console.error('PATCH read error:', error);
      return NextResponse.json({ success: false, message: 'Failed to mark message as read' }, { status: 500 });
    }
  },
  ['doctor', 'hospital']
);
