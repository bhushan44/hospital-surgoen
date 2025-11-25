import { SubscriptionsRepository, CreateSubscriptionPlanData, CreateSubscriptionData, UpdateSubscriptionData, SubscriptionQuery } from '@/lib/repositories/subscriptions.repository';

export class SubscriptionsService {
  private repo = new SubscriptionsRepository();

  async createPlan(dto: CreateSubscriptionPlanData) {
    try {
      const plan = await this.repo.createPlan(dto);
      return {
        success: true,
        message: 'Subscription plan created successfully',
        data: plan,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create subscription plan',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async listPlans() {
    try {
      const plans = await this.repo.listPlans();
      return {
        success: true,
        message: 'Subscription plans retrieved successfully',
        data: plans,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve subscription plans',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getPlan(id: string) {
    try {
      const plan = await this.repo.getPlan(id);
      if (!plan) {
        return {
          success: false,
          message: 'Plan not found',
        };
      }
      return {
        success: true,
        message: 'Subscription plan retrieved successfully',
        data: plan,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve subscription plan',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async updatePlan(id: string, dto: Partial<CreateSubscriptionPlanData>) {
    try {
      const existing = await this.repo.getPlan(id);
      if (!existing) {
        return {
          success: false,
          message: 'Plan not found',
        };
      }
      const plan = await this.repo.updatePlan(id, dto);
      return {
        success: true,
        message: 'Subscription plan updated successfully',
        data: plan,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update subscription plan',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async deletePlan(id: string) {
    try {
      const existing = await this.repo.getPlan(id);
      if (!existing) {
        return {
          success: false,
          message: 'Plan not found',
        };
      }
      await this.repo.deletePlan(id);
      return {
        success: true,
        message: 'Subscription plan deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete subscription plan',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getActiveSubscriptionByUserId(userId: string) {
    try {
      const subscription = await this.repo.getActiveSubscriptionByUserId(userId);
      return {
        success: true,
        message: subscription ? 'Active subscription found' : 'No active subscription found',
        data: subscription || null,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve active subscription',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async create(dto: CreateSubscriptionData) {
    try {
      const plan = await this.repo.getPlan(dto.planId);
      if (!plan) {
        return {
          success: false,
          message: 'Invalid plan',
        };
      }
      const subscription = await this.repo.create(dto);
      return {
        success: true,
        message: 'Subscription created successfully',
        data: subscription,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create subscription',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async list(query: SubscriptionQuery) {
    try {
      const result = await this.repo.list(query);
      return {
        success: true,
        message: 'Subscriptions retrieved successfully',
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve subscriptions',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async get(id: string) {
    try {
      const data = await this.repo.get(id);
      if (!data) {
        return {
          success: false,
          message: 'Subscription not found',
        };
      }
      return {
        success: true,
        message: 'Subscription retrieved successfully',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve subscription',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async update(id: string, dto: UpdateSubscriptionData) {
    try {
      const existing = await this.repo.get(id);
      if (!existing) {
        return {
          success: false,
          message: 'Subscription not found',
        };
      }
      const subscription = await this.repo.update(id, dto);
      return {
        success: true,
        message: 'Subscription updated successfully',
        data: subscription,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update subscription',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async remove(id: string) {
    try {
      const existing = await this.repo.get(id);
      if (!existing) {
        return {
          success: false,
          message: 'Subscription not found',
        };
      }
      await this.repo.remove(id);
      return {
        success: true,
        message: 'Subscription deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete subscription',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}







