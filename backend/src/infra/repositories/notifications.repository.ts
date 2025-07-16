import { PrismaClient } from '@prisma/client';
import { Notification } from '@/domain/entities/Notification.entity';
import { INotificationsRepository } from '@/app/repositories/notifications.repository';

export class NotificationsRepository implements INotificationsRepository {
  constructor(private prisma: PrismaClient) {}

  async create(notification: Notification): Promise<Notification> {
    const created = await this.prisma.notification.create({
      data: notification.toJSON(),
    });
    return new Notification({
      ...created,
      type: created.type as 'success' | 'error' | 'info', // Cast type
    });
  }

  async findByUserId(userId: string, page: number, limit: number): Promise<Notification[]> {
    const skip = (page - 1) * limit;
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
   return notifications.map((n) => new Notification({
      ...n,
      type: n.type as 'success' | 'error' | 'info', // Cast type
    }));
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }
}