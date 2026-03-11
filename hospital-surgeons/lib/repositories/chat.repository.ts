import { getDb } from '@/lib/db';
import { chatConversations, chatMessages, chatMessageAttachments, chatMessageReactions, files, doctors, hospitals } from '@/src/db/drizzle/migrations/schema';
import { eq, and, desc, lt, sql, inArray } from 'drizzle-orm';

export class ChatRepository {
  private db = getDb();

  // ─── Conversations ───────────────────────────────────────────────────────────

  async findConversationByDoctorAndHospital(doctorId: string, hospitalId: string, tx?: any) {
    const db = tx ?? this.db;
    const [conv] = await db
      .select()
      .from(chatConversations)
      .where(and(eq(chatConversations.doctorId, doctorId), eq(chatConversations.hospitalId, hospitalId)))
      .limit(1);
    return conv || null;
  }

  async findConversationById(id: string, tx?: any) {
    const db = tx ?? this.db;
    const [conv] = await db
      .select()
      .from(chatConversations)
      .where(eq(chatConversations.id, id))
      .limit(1);
    return conv || null;
  }

  async createConversation(doctorId: string, hospitalId: string, tx?: any) {
    const db = tx ?? this.db;
    const [conv] = await db
      .insert(chatConversations)
      .values({ doctorId, hospitalId })
      .returning();
    return conv;
  }

  async getConversationsForDoctor(doctorId: string, limit: number, cursor?: string, tx?: any) {
    const db = tx ?? this.db;
    const conditions = cursor
      ? and(eq(chatConversations.doctorId, doctorId), lt(chatConversations.updatedAt, cursor))
      : eq(chatConversations.doctorId, doctorId);
    const rows = await db
      .select({
        id: chatConversations.id,
        doctorId: chatConversations.doctorId,
        hospitalId: chatConversations.hospitalId,
        lastMessageAt: chatConversations.lastMessageAt,
        doctorUnreadCount: chatConversations.doctorUnreadCount,
        hospitalUnreadCount: chatConversations.hospitalUnreadCount,
        isActive: chatConversations.isActive,
        createdAt: chatConversations.createdAt,
        updatedAt: chatConversations.updatedAt,
        hospitalName: hospitals.name,
        hospitalLogoId: hospitals.logoId,
      })
      .from(chatConversations)
      .leftJoin(hospitals, eq(chatConversations.hospitalId, hospitals.id))
      .where(conditions)
      .orderBy(desc(chatConversations.updatedAt))
      .limit(limit + 1);
    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    return { conversations: data, hasMore, nextCursor: hasMore ? data[data.length - 1].updatedAt : null };
  }

  async getConversationsForHospital(hospitalId: string, limit: number, cursor?: string, tx?: any) {
    const db = tx ?? this.db;
    const conditions = cursor
      ? and(eq(chatConversations.hospitalId, hospitalId), lt(chatConversations.updatedAt, cursor))
      : eq(chatConversations.hospitalId, hospitalId);
    const rows = await db
      .select({
        id: chatConversations.id,
        doctorId: chatConversations.doctorId,
        hospitalId: chatConversations.hospitalId,
        lastMessageAt: chatConversations.lastMessageAt,
        doctorUnreadCount: chatConversations.doctorUnreadCount,
        hospitalUnreadCount: chatConversations.hospitalUnreadCount,
        isActive: chatConversations.isActive,
        createdAt: chatConversations.createdAt,
        updatedAt: chatConversations.updatedAt,
        doctorFirstName: doctors.firstName,
        doctorLastName: doctors.lastName,
        doctorProfilePhotoId: doctors.profilePhotoId,
      })
      .from(chatConversations)
      .leftJoin(doctors, eq(chatConversations.doctorId, doctors.id))
      .where(conditions)
      .orderBy(desc(chatConversations.updatedAt))
      .limit(limit + 1);
    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    return { conversations: data, hasMore, nextCursor: hasMore ? data[data.length - 1].updatedAt : null };
  }

  async incrementUnreadCount(conversationId: string, party: 'doctor' | 'hospital', tx?: any) {
    const db = tx ?? this.db;
    const field = party === 'doctor' ? 'doctor_unread_count' : 'hospital_unread_count';
    await db
      .update(chatConversations)
      .set({
        [field]: sql`${party === 'doctor' ? chatConversations.doctorUnreadCount : chatConversations.hospitalUnreadCount} + 1`,
        updatedAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
      })
      .where(eq(chatConversations.id, conversationId));
  }

  async resetUnreadCount(conversationId: string, party: 'doctor' | 'hospital', tx?: any) {
    const db = tx ?? this.db;
    const patch = party === 'doctor'
      ? { doctorUnreadCount: 0, updatedAt: new Date().toISOString() }
      : { hospitalUnreadCount: 0, updatedAt: new Date().toISOString() };
    await db.update(chatConversations).set(patch).where(eq(chatConversations.id, conversationId));
  }

  // ─── Messages ────────────────────────────────────────────────────────────────

  async createMessage(data: {
    conversationId: string;
    senderType: 'doctor' | 'hospital';
    senderId: string;
    content: string;
    messageType?: 'text' | 'attachment' | 'system';
    replyToId?: string | null;
  }, tx?: any) {
    const db = tx ?? this.db;
    const [msg] = await db
      .insert(chatMessages)
      .values({
        conversationId: data.conversationId,
        senderType: data.senderType,
        senderId: data.senderId,
        content: data.content,
        messageType: data.messageType ?? 'text',
        replyToId: data.replyToId ?? null,
      })
      .returning();
    return msg;
  }

  async findMessageById(id: string, tx?: any) {
    const db = tx ?? this.db;
    const [msg] = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.id, id))
      .limit(1);
    return msg || null;
  }

  async getMessages(conversationId: string, limit: number, cursor?: string, tx?: any) {
    const db = tx ?? this.db;
    const conditions = cursor
      ? and(eq(chatMessages.conversationId, conversationId), lt(chatMessages.createdAt, cursor))
      : eq(chatMessages.conversationId, conversationId);
    const rows = await db
      .select()
      .from(chatMessages)
      .where(conditions)
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit + 1);
    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    return { messages: data.reverse(), hasMore, nextCursor: hasMore ? data[data.length - 1].createdAt : null };
  }

  async markMessageAsRead(messageId: string, tx?: any) {
    const db = tx ?? this.db;
    const [msg] = await db
      .update(chatMessages)
      .set({ isRead: true, readAt: new Date().toISOString() })
      .where(eq(chatMessages.id, messageId))
      .returning();
    return msg;
  }

  async softDeleteMessage(messageId: string, tx?: any) {
    const db = tx ?? this.db;
    const [msg] = await db
      .update(chatMessages)
      .set({ isDeleted: true, deletedAt: new Date().toISOString(), content: '[deleted]' })
      .where(eq(chatMessages.id, messageId))
      .returning();
    return msg;
  }

  async editMessage(messageId: string, content: string, tx?: any) {
    const db = tx ?? this.db;
    const [msg] = await db
      .update(chatMessages)
      .set({ content, isEdited: true, editedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      .where(eq(chatMessages.id, messageId))
      .returning();
    return msg;
  }

  // ─── Attachments ─────────────────────────────────────────────────────────────

  async createAttachment(data: {
    messageId: string;
    conversationId: string;
    fileId: string;
    uploadedBy: 'doctor' | 'hospital';
  }, tx?: any) {
    const db = tx ?? this.db;
    const [attachment] = await db
      .insert(chatMessageAttachments)
      .values(data)
      .returning();
    return attachment;
  }

  async getAttachmentsForMessage(messageId: string, tx?: any) {
    const db = tx ?? this.db;
    return db
      .select({
        id: chatMessageAttachments.id,
        messageId: chatMessageAttachments.messageId,
        fileId: chatMessageAttachments.fileId,
        uploadedBy: chatMessageAttachments.uploadedBy,
        uploadedAt: chatMessageAttachments.uploadedAt,
        filename: files.filename,
        url: files.url,
        mimetype: files.mimetype,
        size: files.size,
        cdnUrl: files.cdnUrl,
      })
      .from(chatMessageAttachments)
      .leftJoin(files, eq(chatMessageAttachments.fileId, files.id))
      .where(eq(chatMessageAttachments.messageId, messageId));
  }

  async getAttachmentsForMessages(messageIds: string[], tx?: any) {
    if (messageIds.length === 0) return [];
    const db = tx ?? this.db;
    return db
      .select({
        id: chatMessageAttachments.id,
        messageId: chatMessageAttachments.messageId,
        fileId: chatMessageAttachments.fileId,
        uploadedBy: chatMessageAttachments.uploadedBy,
        uploadedAt: chatMessageAttachments.uploadedAt,
        filename: files.filename,
        url: files.url,
        mimetype: files.mimetype,
        size: files.size,
        cdnUrl: files.cdnUrl,
      })
      .from(chatMessageAttachments)
      .leftJoin(files, eq(chatMessageAttachments.fileId, files.id))
      .where(inArray(chatMessageAttachments.messageId, messageIds));
  }

  async getReactionsForMessages(messageIds: string[], tx?: any) {
    if (messageIds.length === 0) return [];
    const db = tx ?? this.db;
    return db
      .select()
      .from(chatMessageReactions)
      .where(inArray(chatMessageReactions.messageId, messageIds));
  }

  async getAttachmentsForConversation(conversationId: string, tx?: any) {
    const db = tx ?? this.db;
    return db
      .select({
        id: chatMessageAttachments.id,
        messageId: chatMessageAttachments.messageId,
        fileId: chatMessageAttachments.fileId,
        uploadedBy: chatMessageAttachments.uploadedBy,
        uploadedAt: chatMessageAttachments.uploadedAt,
        filename: files.filename,
        url: files.url,
        mimetype: files.mimetype,
        size: files.size,
        cdnUrl: files.cdnUrl,
      })
      .from(chatMessageAttachments)
      .leftJoin(files, eq(chatMessageAttachments.fileId, files.id))
      .where(eq(chatMessageAttachments.conversationId, conversationId));
  }

  async findFileById(fileId: string, tx?: any) {
    const db = tx ?? this.db;
    const [file] = await db
      .select()
      .from(files)
      .where(eq(files.id, fileId))
      .limit(1);
    return file || null;
  }

  // ─── Reactions ───────────────────────────────────────────────────────────────

  async findReaction(messageId: string, reactorId: string, tx?: any) {
    const db = tx ?? this.db;
    const [reaction] = await db
      .select()
      .from(chatMessageReactions)
      .where(and(eq(chatMessageReactions.messageId, messageId), eq(chatMessageReactions.reactorId, reactorId)))
      .limit(1);
    return reaction || null;
  }

  async createReaction(data: {
    messageId: string;
    conversationId: string;
    reactorType: 'doctor' | 'hospital';
    reactorId: string;
    emoji: string;
  }, tx?: any) {
    const db = tx ?? this.db;
    const [reaction] = await db
      .insert(chatMessageReactions)
      .values(data)
      .returning();
    return reaction;
  }

  async deleteReaction(id: string, tx?: any) {
    const db = tx ?? this.db;
    await db.delete(chatMessageReactions).where(eq(chatMessageReactions.id, id));
  }

  async updateReactionEmoji(id: string, emoji: string, tx?: any) {
    const db = tx ?? this.db;
    const [reaction] = await db
      .update(chatMessageReactions)
      .set({ emoji })
      .where(eq(chatMessageReactions.id, id))
      .returning();
    return reaction;
  }

  async getReactionsForMessage(messageId: string, tx?: any) {
    const db = tx ?? this.db;
    return db
      .select()
      .from(chatMessageReactions)
      .where(eq(chatMessageReactions.messageId, messageId));
  }
}
