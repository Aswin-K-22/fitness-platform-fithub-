import { Server, Socket } from 'socket.io';
import { Notification } from '@/domain/entities/Notification.entity';
import { JwtTokenService } from '@/infra/providers/jwtTokenService';
import { INotificationsRepository } from '@/app/repositories/notifications.repository';

export class NotificationService {
  private connectedUsers: Map<string, Socket> = new Map();

  constructor(
    private io: Server,
    private notificationsRepository: INotificationsRepository,
    private tokenService: JwtTokenService
  ) {
    this.setupSocketEvents();
  }

  private setupSocketEvents() {
    this.io.use(async (socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }
      try {
        const payload = await this.tokenService.verifyAccessToken(token);
        if (!payload.id) {
          return next(new Error('Authentication error: Invalid token'));
        }
        socket.data.userId = payload.id;
        next();
      } catch (error) {
        return next(new Error('Authentication error: Invalid or expired token'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      console.log(`[NotificationService] Socket connected: ${socket.id}`);

      socket.on('join', (userId: string) => {
        if (socket.data.userId !== userId) {
          console.log(`[NotificationService] Unauthorized join attempt by ${socket.data.userId} for ${userId}`);
          socket.disconnect();
          return;
        }
        console.log(`[NotificationService] User ${userId} joined with socket ${socket.id}`);
        this.connectedUsers.set(userId, socket);
        socket.join(userId);
        this.sendUnreadCount(userId);
      });

      socket.on('disconnect', () => {
        console.log(`[NotificationService] Socket disconnected: ${socket.id}`);
        for (const [userId, s] of this.connectedUsers.entries()) {
          if (s.id === socket.id) {
            this.connectedUsers.delete(userId);
            break;
          }
        }
      });

      socket.on('markNotificationRead', async (notificationId: string) => {
        await this.notificationsRepository.markAsRead(notificationId);
        const userId = [...this.connectedUsers.entries()].find(
          ([, s]) => s.id === socket.id
        )?.[0];
        if (userId) {
          this.sendUnreadCount(userId);
        }
      });
    });
  }

  async sendNotification(notification: Notification) {
    const savedNotification = await this.notificationsRepository.create(notification);
    console.log(`[NotificationService] Notification saved:`, savedNotification);

    const userSocket = this.connectedUsers.get(notification.userId);
    if (userSocket) {
      this.io.to(notification.userId).emit('notification', savedNotification.toJSON());
      console.log(`[NotificationService] Notification sent to user ${notification.userId}:`, savedNotification);
    }

    this.sendUnreadCount(notification.userId);
  }

  async sendUnreadCount(userId: string) {
    const count = await this.notificationsRepository.countUnreadByUserId(userId);
    this.io.to(userId).emit('unreadCount', count);
    console.log(`[NotificationService] Unread count sent to user ${userId}: ${count}`);
  }
}