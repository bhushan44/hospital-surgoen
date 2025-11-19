import { getDb } from '@/lib/db';
import { 
  payments, // Keep for backward compatibility
  paymentTransactions, // For subscription payments
  assignmentPayments, // For assignment payments
  users, 
  subscriptions, 
  assignments 
} from '@/src/db/drizzle/migrations/schema';
import { eq, desc, sql } from 'drizzle-orm';

export interface CreatePaymentData {
  userId?: string; // For subscription payments
  subscriptionId?: string;
  assignmentId?: string; // For assignment payments (replaces bookingId)
  paymentType: 'subscription' | 'assignment' | 'commission';
  amount: number;
  status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'processing';
  paymentGateway?: string;
  gatewayTransactionId?: string; // Maps to paymentId in paymentTransactions
  paidAt?: string;
  // For assignment payments:
  hospitalId?: string;
  doctorId?: string;
  consultationFee?: number;
  platformCommission?: number;
  doctorPayout?: number;
}

export interface PaymentQuery {
  page?: number;
  limit?: number;
  userId?: string;
  status?: string;
  paymentType?: string;
}

export class PaymentsRepository {
  private db = getDb();

  async create(dto: CreatePaymentData) {
    // Route to appropriate table based on payment type
    if (dto.paymentType === 'subscription' && dto.subscriptionId) {
      // Use paymentTransactions for subscription payments
      // Note: paymentTransactions requires orderId, not subscriptionId directly
      // This might need adjustment based on orders table structure
      const [row] = await this.db
        .insert(paymentTransactions)
        .values({
          orderId: dto.subscriptionId, // This should be orderId, may need mapping
          paymentGateway: dto.paymentGateway || 'unknown',
          paymentId: dto.gatewayTransactionId || '',
          amount: BigInt(Math.round(dto.amount * 100)), // Convert to cents (bigint)
          currency: 'USD',
          status: dto.status || 'pending',
          verifiedAt: dto.paidAt,
        })
        .returning();
      return row;
    } else if (dto.paymentType === 'assignment' && dto.assignmentId) {
      // Use assignmentPayments for assignment payments
      if (!dto.hospitalId || !dto.doctorId || !dto.consultationFee) {
        throw new Error('Assignment payment requires hospitalId, doctorId, and consultationFee');
      }
      const consultationFee = dto.consultationFee;
      const platformCommission = dto.platformCommission || 0;
      const doctorPayout = dto.doctorPayout || (consultationFee - platformCommission);
      
      const [row] = await this.db
        .insert(assignmentPayments)
        .values({
          assignmentId: dto.assignmentId,
          hospitalId: dto.hospitalId,
          doctorId: dto.doctorId,
          consultationFee: consultationFee.toString(),
          platformCommission: platformCommission.toString(),
          doctorPayout: doctorPayout.toString(),
          paymentStatus: (dto.status || 'pending') as any,
          paidToDoctorAt: dto.paidAt,
        })
        .returning();
      return row;
    } else {
      // Fallback to old payments table for backward compatibility
      const [row] = await this.db
        .insert(payments)
        .values({
          userId: dto.userId || '',
          subscriptionId: dto.subscriptionId,
          bookingId: dto.assignmentId, // Map assignmentId to bookingId for compatibility
          paymentType: dto.paymentType as any,
          amount: dto.amount.toString(),
          status: (dto.status || 'pending') as any,
          paymentGateway: dto.paymentGateway,
          gatewayTransactionId: dto.gatewayTransactionId,
          paidAt: dto.paidAt,
        })
        .returning();
      return row;
    }
  }

  async list(query: PaymentQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;

    // For now, query both tables and combine results
    // In production, you might want separate endpoints or better query logic
    
    // Query paymentTransactions (subscription payments)
    const subscriptionPayments = await this.db
      .select({
        payment: paymentTransactions,
        type: sql<string>`'subscription'`.as('paymentType'),
      })
      .from(paymentTransactions)
      .leftJoin(subscriptions, eq(subscriptions.paymentTransactionId, paymentTransactions.id))
      .leftJoin(users, eq(users.id, subscriptions.userId))
      .where(query.userId ? eq(users.id, query.userId) : undefined)
      .orderBy(desc(paymentTransactions.createdAt))
      .limit(limit)
      .offset(offset);

    // Query assignmentPayments (assignment payments)
    const assignmentPaymentsList = await this.db
      .select({
        payment: assignmentPayments,
        type: sql<string>`'assignment'`.as('paymentType'),
      })
      .from(assignmentPayments)
      .leftJoin(assignments, eq(assignments.id, assignmentPayments.assignmentId))
      .where(query.userId ? eq(assignments.hospitalId, query.userId) : undefined) // Approximate user filter
      .orderBy(desc(assignmentPayments.createdAt))
      .limit(limit)
      .offset(offset);

    // Combine and sort (simplified - in production, use UNION or separate queries)
    const data = [...subscriptionPayments, ...assignmentPaymentsList]
      .sort((a, b) => {
        const aDate = a.payment.createdAt || '';
        const bDate = b.payment.createdAt || '';
        return bDate.localeCompare(aDate);
      })
      .slice(0, limit);

    return { data, total: data.length, page, limit };
  }

  async get(id: string) {
    // Try paymentTransactions first
    const transactionPayment = await this.db
      .select({
        payment: paymentTransactions,
        type: sql<string>`'subscription'`.as('paymentType'),
      })
      .from(paymentTransactions)
      .where(eq(paymentTransactions.id, id))
      .limit(1);
    
    if (transactionPayment[0]) return transactionPayment[0];

    // Try assignmentPayments
    const assignmentPayment = await this.db
      .select({
        payment: assignmentPayments,
        type: sql<string>`'assignment'`.as('paymentType'),
      })
      .from(assignmentPayments)
      .where(eq(assignmentPayments.id, id))
      .limit(1);
    
    if (assignmentPayment[0]) return assignmentPayment[0];

    // Fallback to old payments table
    const [row] = await this.db
      .select({
        payment: payments,
        type: sql<string>`'legacy'`.as('paymentType'),
      })
      .from(payments)
      .leftJoin(users, eq(users.id, payments.userId))
      .leftJoin(subscriptions, eq(subscriptions.id, payments.subscriptionId))
      .where(eq(payments.id, id))
      .limit(1);
    return row;
  }

  async update(id: string, dto: Partial<CreatePaymentData>) {
    // Try to update in paymentTransactions first
    try {
      const updateFields: any = {};
      if (dto.status) updateFields.status = dto.status;
      if (dto.gatewayTransactionId) updateFields.paymentId = dto.gatewayTransactionId;
      if (dto.paidAt) updateFields.verifiedAt = dto.paidAt;
      
      const [row] = await this.db
        .update(paymentTransactions)
        .set(updateFields)
        .where(eq(paymentTransactions.id, id))
        .returning();
      if (row) return row;
    } catch (e) {
      // Not a paymentTransaction, try assignmentPayments
    }

    // Try assignmentPayments
    try {
      const updateFields: any = {};
      if (dto.status) updateFields.paymentStatus = dto.status as any;
      if (dto.paidAt) updateFields.paidToDoctorAt = dto.paidAt;
      
      const [row] = await this.db
        .update(assignmentPayments)
        .set(updateFields)
        .where(eq(assignmentPayments.id, id))
        .returning();
      if (row) return row;
    } catch (e) {
      // Not an assignmentPayment, try old payments table
    }

    // Fallback to old payments table
    const updateFields: any = {};
    if (dto.userId) updateFields.userId = dto.userId;
    if (dto.subscriptionId !== undefined) updateFields.subscriptionId = dto.subscriptionId;
    if (dto.assignmentId !== undefined) updateFields.bookingId = dto.assignmentId;
    if (dto.paymentType) updateFields.paymentType = dto.paymentType as any;
    if (dto.amount !== undefined) updateFields.amount = dto.amount.toString();
    if (dto.status) updateFields.status = dto.status as any;
    if (dto.paymentGateway) updateFields.paymentGateway = dto.paymentGateway;
    if (dto.gatewayTransactionId) updateFields.gatewayTransactionId = dto.gatewayTransactionId;
    if (dto.paidAt) updateFields.paidAt = dto.paidAt;

    const [row] = await this.db
      .update(payments)
      .set(updateFields)
      .where(eq(payments.id, id))
      .returning();
    return row;
  }

  async remove(id: string) {
    // Try to delete from all tables (cascade should handle it)
    try {
      await this.db.delete(paymentTransactions).where(eq(paymentTransactions.id, id));
    } catch (e) {
      try {
        await this.db.delete(assignmentPayments).where(eq(assignmentPayments.id, id));
      } catch (e2) {
        await this.db.delete(payments).where(eq(payments.id, id));
      }
    }
  }
}


