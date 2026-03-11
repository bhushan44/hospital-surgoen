import { NextResponse } from 'next/server';
import { withAuthAndContext, AuthenticatedRequest } from '@/lib/auth/middleware';
import { ChatService } from '@/lib/services/chat.service';
import { EditMessageDtoSchema } from '@/lib/validations/chat.dto';

const chatService = new ChatService();

type Params = { params: Promise<{ conversationId: string; messageId: string }> };

/**
 * PATCH /api/chats/[conversationId]/messages/[messageId]
 * Edit a message (only the sender can edit, cannot edit deleted messages).
 */
export const PATCH = withAuthAndContext<Params>(
  async (req: AuthenticatedRequest, context) => {
    try {
      const { conversationId, messageId } = await context.params;
      const { userId, userRole } = req.user!;

      const body = await req.json();
      const parsed = EditMessageDtoSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 });
      }

      const message = await chatService.editMessage(conversationId, messageId, parsed.data.content, userId, userRole);
      return NextResponse.json({ success: true, data: message });
    } catch (error: any) {
      const status = error.statusCode || 500;
      if (status < 500) return NextResponse.json({ success: false, message: error.message }, { status });
      console.error('PATCH /api/chats/[conversationId]/messages/[messageId] error:', error);
      return NextResponse.json({ success: false, message: 'Failed to edit message' }, { status: 500 });
    }
  },
  ['doctor', 'hospital']
);

/**
 * DELETE /api/chats/[conversationId]/messages/[messageId]
 * Soft-delete a message (only the sender can delete).
 */
export const DELETE = withAuthAndContext<Params>(
  async (req: AuthenticatedRequest, context) => {
    try {
      const { conversationId, messageId } = await context.params;
      const { userId, userRole } = req.user!;

      await chatService.deleteMessage(conversationId, messageId, userId, userRole);
      return NextResponse.json({ success: true, message: 'Message deleted' });
    } catch (error: any) {
      const status = error.statusCode || 500;
      if (status < 500) return NextResponse.json({ success: false, message: error.message }, { status });
      console.error('DELETE /api/chats/[conversationId]/messages/[messageId] error:', error);
      return NextResponse.json({ success: false, message: 'Failed to delete message' }, { status: 500 });
    }
  },
  ['doctor', 'hospital']
);
