import { getDb } from '@/lib/db';
import { subscriptionPlans, subscriptions } from '@/src/db/drizzle/migrations/schema';
import { eq, and, sql, desc, gte, lte } from 'drizzle-orm';

export interface CreateSubscriptionPlanData {
  name: string;
  tier: 'free' | 'basic' | 'premium' | 'enterprise';
  userRole: 'doctor' | 'hospital' | 'admin';
  price: number;
  billingCycle: string;
  maxBookings?: number;
  commissionRate: number;
  features?: Record<string, any>;
  isActive?: boolean;
}

export interface CreateSubscriptionData {
  userId: string;
  planId: string;
  status?: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: string;
  endDate: string;
  autoRenew?: boolean;
  bookingsUsed?: number;
}

export interface UpdateSubscriptionData {
  userId?: string;
  planId?: string;
  status?: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate?: string;
  endDate?: string;
  autoRenew?: boolean;
  bookingsUsed?: number;
}

export interface SubscriptionQuery {
  page?: number;
  limit?: number;
  userId?: string;
  planId?: string;
  status?: string;
  startDateFrom?: string;
  startDateTo?: string;
}

export class SubscriptionsRepository {
  private db = getDb();

  async createPlan(dto: CreateSubscriptionPlanData) {
    const [row] = await this.db
      .insert(subscriptionPlans)
      .values({
        name: dto.name,
        tier: dto.tier as any,
        userRole: dto.userRole as any,
        price: dto.price.toString(),
        billingCycle: dto.billingCycle,
        maxBookings: dto.maxBookings,
        commissionRate: dto.commissionRate.toString(),
        features: dto.features,
        isActive: dto.isActive ?? true,
      })
      .returning();
    return row;
  }

  async listPlans() {
    return this.db.select().from(subscriptionPlans).orderBy(desc(subscriptionPlans.createdAt));
  }

  async getPlan(id: string) {
    const [row] = await this.db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id)).limit(1);
    return row;
  }

  async updatePlan(id: string, dto: Partial<CreateSubscriptionPlanData>) {
    const updateFields: any = {};
    
    if (dto.name) updateFields.name = dto.name;
    if (dto.tier) updateFields.tier = dto.tier as any;
    if (dto.userRole) updateFields.userRole = dto.userRole as any;
    if (dto.price !== undefined) updateFields.price = dto.price.toString();
    if (dto.billingCycle) updateFields.billingCycle = dto.billingCycle;
    if (dto.maxBookings !== undefined) updateFields.maxBookings = dto.maxBookings;
    if (dto.commissionRate !== undefined) updateFields.commissionRate = dto.commissionRate.toString();
    if (dto.features !== undefined) updateFields.features = dto.features;
    if (dto.isActive !== undefined) updateFields.isActive = dto.isActive;

    const [row] = await this.db
      .update(subscriptionPlans)
      .set(updateFields)
      .where(eq(subscriptionPlans.id, id))
      .returning();
    return row;
  }

  async deletePlan(id: string) {
    await this.db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
  }

  async create(dto: CreateSubscriptionData) {
    const [row] = await this.db
      .insert(subscriptions)
      .values({
        userId: dto.userId,
        planId: dto.planId,
        status: (dto.status || 'pending') as any,
        startDate: dto.startDate,
        endDate: dto.endDate,
        autoRenew: dto.autoRenew ?? true,
        bookingsUsed: dto.bookingsUsed ?? 0,
      })
      .returning();
    return row;
  }

  async list(query: SubscriptionQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;

    const whereConditions = [];
    if (query.userId) whereConditions.push(eq(subscriptions.userId, query.userId));
    if (query.planId) whereConditions.push(eq(subscriptions.planId, query.planId));
    if (query.status) whereConditions.push(eq(subscriptions.status, query.status as any));
    if (query.startDateFrom) whereConditions.push(gte(subscriptions.startDate, query.startDateFrom));
    if (query.startDateTo) whereConditions.push(lte(subscriptions.startDate, query.startDateTo));

    const data = await this.db
      .select({ subscription: subscriptions, plan: subscriptionPlans })
      .from(subscriptions)
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(subscriptions.createdAt))
      .limit(limit)
      .offset(offset);

    return { data, page, limit };
  }

  async get(id: string) {
    const [row] = await this.db
      .select({ subscription: subscriptions, plan: subscriptionPlans })
      .from(subscriptions)
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(eq(subscriptions.id, id))
      .limit(1);
    return row;
  }

  async update(id: string, dto: UpdateSubscriptionData) {
    const updateFields: any = {};
    
    if (dto.userId) updateFields.userId = dto.userId;
    if (dto.planId) updateFields.planId = dto.planId;
    if (dto.status) updateFields.status = dto.status as any;
    if (dto.startDate) updateFields.startDate = dto.startDate;
    if (dto.endDate) updateFields.endDate = dto.endDate;
    if (dto.autoRenew !== undefined) updateFields.autoRenew = dto.autoRenew;
    if (dto.bookingsUsed !== undefined) updateFields.bookingsUsed = dto.bookingsUsed;

    const [row] = await this.db
      .update(subscriptions)
      .set(updateFields)
      .where(eq(subscriptions.id, id))
      .returning();
    return row;
  }

  async remove(id: string) {
    await this.db.delete(subscriptions).where(eq(subscriptions.id, id));
  }
}


