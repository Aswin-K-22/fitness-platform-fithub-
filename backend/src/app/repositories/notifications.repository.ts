import { Notification } from '@/domain/entities/Notification.entity';

export interface INotificationsRepository {
  create(notification: Notification): Promise<Notification>;
  findByUserId(userId: string, page: number, limit: number): Promise<Notification[]>;
  countUnreadByUserId(userId: string): Promise<number>;
  markAsRead(notificationId: string): Promise<void>;
}