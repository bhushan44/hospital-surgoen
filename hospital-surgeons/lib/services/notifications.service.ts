import { NotificationsRepository, CreateNotificationData, NotificationQuery } from '@/lib/repositories/notifications.repository';

export class NotificationsService {
  private repo = new NotificationsRepository();

  async create(dto: CreateNotificationData) {
    try {
      const notification = await this.repo.create(dto);
      return {
        success: true,
        message: 'Notification created successfully',
        data: notification,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create notification',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async list(query: NotificationQuery) {
    try {
      const result = await this.repo.list(query);
      return {
        success: true,
        message: 'Notifications retrieved successfully',
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve notifications',
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
          message: 'Notification not found',
        };
      }
      return {
        success: true,
        message: 'Notification retrieved successfully',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve notification',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async markRead(id: string) {
    try {
      const notification = await this.repo.markRead(id, true);
      return {
        success: true,
        message: 'Notification marked as read',
        data: notification,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to mark notification as read',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async markUnread(id: string) {
    try {
      const notification = await this.repo.markRead(id, false);
      return {
        success: true,
        message: 'Notification marked as unread',
        data: notification,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to mark notification as unread',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getPreferences(userId: string) {
    try {
      const prefs = await this.repo.getPreferences(userId);
      return {
        success: true,
        message: 'Notification preferences retrieved successfully',
        data: prefs,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve notification preferences',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async upsertPreferences(userId: string, prefs: {
    bookingUpdatesPush?: boolean;
    bookingUpdatesEmail?: boolean;
    paymentPush?: boolean;
    remindersPush?: boolean;
  }) {
    try {
      const result = await this.repo.upsertPreferences(userId, prefs);
      return {
        success: true,
        message: 'Notification preferences updated successfully',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update notification preferences',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}









