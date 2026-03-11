import { NextResponse } from 'next/server';
import { withAuthAndContext, AuthenticatedRequest } from '@/lib/auth/middleware';
import { ChatService } from '@/lib/services/chat.service';
import { AddReactionDtoSchema } from '@/lib/validations/chat.dto';

const chatService = new ChatService();

type Params = { params: Promise<{ conversationId: string; messageId: string }> };

/**
 * POST /api/chats/[conversationId]/messages/[messageId]/reactions
 * Toggle an emoji reaction on a message.
 * - Same emoji from same user → removes the reaction
 * - Different emoji from same user → replaces the reaction
 * - New emoji from user → adds the reaction
 */
export const POST = withAuthAndContext<Params>(
  async (req: AuthenticatedRequest, context) => {
    try {
      const { conversationId, messageId } = await context.params;
      const { userId, userRole } = req.user!;

      const body = await req.json();
      const parsed = AddReactionDtoSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ success: false, message: parsed.error.errors[0].message }, { status: 400 });
      }

      const reactions = await chatService.toggleReaction(conversationId, messageId, userId, userRole, parsed.data);
      return NextResponse.json({ success: true, data: { messageId, reactions } });
    } catch (error: any) {
      const status = error.statusCode || 500;
      if (status < 500) return NextResponse.json({ success: false, message: error.message }, { status });
      console.error('POST reactions error:', error);
      return NextResponse.json({ success: false, message: 'Failed to toggle reaction' }, { status: 500 });
    }
  },
  ['doctor', 'hospital']
);
