import { NextResponse } from 'next/server';
import { withAuthAndContext, AuthenticatedRequest } from '@/lib/auth/middleware';
import { ChatService } from '@/lib/services/chat.service';

const chatService = new ChatService();

/**
 * GET /api/chats/[conversationId]
 * Get a single conversation's details and messages.
 */
export const GET = withAuthAndContext<{ params: Promise<{ conversationId: string }> }>(
  async (req: AuthenticatedRequest, context) => {
    try {
      const { conversationId } = await context.params;
      const { userId, userRole } = req.user!;
      const { searchParams } = new URL(req.url);
      const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
      const cursor = searchParams.get('cursor') || undefined;

      const conversation = await chatService.getConversationById(conversationId, userId, userRole);
      const messagesResult = await chatService.getMessages(conversationId, userId, userRole, limit, cursor);

      return NextResponse.json({
        success: true,
        data: {
          conversation,
          messages: messagesResult.messages,
          hasMore: messagesResult.hasMore,
          nextCursor: messagesResult.nextCursor,
        },
      });
    } catch (error: any) {
      const status = error.statusCode || 500;
      if (status < 500) return NextResponse.json({ success: false, message: error.message }, { status });
      console.error('GET /api/chats/[conversationId] error:', error);
      return NextResponse.json({ success: false, message: 'Failed to fetch conversation' }, { status: 500 });
    }
  },
  ['doctor', 'hospital']
);

/**
 * DELETE /api/chats/[conversationId]
 * Soft-delete (archive) a conversation — sets isActive = false.
 * Only a participant of the conversation can delete it.
 */
export const DELETE = withAuthAndContext<{ params: Promise<{ conversationId: string }> }>(
  async (req: AuthenticatedRequest, context) => {
    try {
      const { conversationId } = await context.params;
      const { userId, userRole } = req.user!;

      await chatService.deleteConversation(conversationId, userId, userRole);
      return NextResponse.json({ success: true, message: 'Conversation deleted' });
    } catch (error: any) {
      const status = error.statusCode || 500;
      if (status < 500) return NextResponse.json({ success: false, message: error.message }, { status });
      console.error('DELETE /api/chats/[conversationId] error:', error);
      return NextResponse.json({ success: false, message: 'Failed to delete conversation' }, { status: 500 });
    }
  },
  ['doctor', 'hospital']
);
