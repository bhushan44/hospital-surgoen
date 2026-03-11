import { NextResponse } from 'next/server';
import { withAuthAndContext, AuthenticatedRequest } from '@/lib/auth/middleware';
import { ChatService } from '@/lib/services/chat.service';
import { ChatRepository } from '@/lib/repositories/chat.repository';

const chatService = new ChatService();
const chatRepo = new ChatRepository();

type Params = { params: Promise<{ conversationId: string }> };

/**
 * GET /api/chats/[conversationId]/attachments
 * Get all file attachments in a conversation (media gallery).
 *
 * To send attachments:
 *   1. Upload file via POST /api/files/upload → get fileId
 *   2. Send message via POST /api/chats/[conversationId]/messages with attachmentIds: [fileId]
 */
export const GET = withAuthAndContext<Params>(
  async (req: AuthenticatedRequest, context) => {
    try {
      const { conversationId } = await context.params;
      const { userId, userRole } = req.user!;

      await chatService.getConversationById(conversationId, userId, userRole);

      const attachments = await chatRepo.getAttachmentsForConversation(conversationId);
      return NextResponse.json({ success: true, data: attachments });
    } catch (error: any) {
      const status = error.statusCode || 500;
      if (status < 500) return NextResponse.json({ success: false, message: error.message }, { status });
      console.error('GET /api/chats/[conversationId]/attachments error:', error);
      return NextResponse.json({ success: false, message: 'Failed to fetch attachments' }, { status: 500 });
    }
  },
  ['doctor', 'hospital']
);
