import { NextRequest, NextResponse } from 'next/server';
import { FilesService } from '@/lib/services/files.service';
import { ChatService } from '@/lib/services/chat.service';
import { withAuthAndContext, AuthenticatedRequest } from '@/lib/auth/middleware';

/**
 * @swagger
 * /api/chats/{conversationId}/attachments/upload:
 *   post:
 *     summary: Upload an attachment for a chat conversation
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Conversation ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Insufficient permissions
 */
async function postHandler(req: AuthenticatedRequest, context: { params: Promise<{ conversationId: string }> }) {
  try {
    const { conversationId } = await context.params;
    const { userId, userRole } = req.user!;
    
    // 1. Verify access to conversation
    const chatService = new ChatService();
    const conversation = await chatService.getConversationById(conversationId, userId, userRole);
    if (!conversation) {
      return NextResponse.json(
        { success: false, message: 'Conversation not found or unauthorized' },
        { status: 404 }
      );
    }

    // 2. Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // 3. Size limit 25MB
    const MAX_FILE_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: 'File too large. Maximum size is 25MB.' },
        { status: 400 }
      );
    }

    // 4. Determine bucket securely
    const isImage = file.type.startsWith('image/');
    const bucket = isImage ? 'images' : 'documents';
    
    // Determine folder securely based on conversation ID
    const folder = `chats/${conversationId}`;

    // 5. Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 6. Upload file
    const filesService = new FilesService();
    const result = await filesService.uploadAndSave({
      buffer,
      filename: file.name,
      folder,
      mimetype: file.type,
      size: file.size,
      bucket,
      isPublic: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Attachment uploaded successfully',
      data: {
        fileId: result.fileId,
        url: result.url,
        path: result.path,
        filename: file.name,
      },
    });
  } catch (error: any) {
    console.error('Chat attachment upload error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to upload attachment' },
      { status: 500 }
    );
  }
}

export const POST = withAuthAndContext(postHandler, ['doctor', 'hospital']);
