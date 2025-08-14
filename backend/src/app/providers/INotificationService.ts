// INotificationService.ts — interface for notification operations
import { Notification } from "@/domain/entities/Notification.entity";

export interface INotificationService {
  sendNotification(notification: Notification): Promise<void>;
  sendUnreadCount(userId: string): Promise<void>;
  markAsReadAndEmit(notificationId: string, userId: string): Promise<void>;
}
