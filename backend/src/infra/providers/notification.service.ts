import { Server, Socket } from 'socket.io';
import { Notification } from '@/domain/entities/Notification.entity';
import { JwtTokenService } from '@/infra/providers/jwtTokenService';
import { INotificationsRepository } from '@/app/repositories/notifications.repository';
import cookie from "cookie";
import { INotificationService } from '@/app/providers/INotificationService';
import { ITokenService } from '@/app/providers/token.service';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { MESSAGES } from '@/domain/constants/messages.constant';

export class NotificationService implements INotificationService {
  private connectedUsers: Map<string, Socket> = new Map();

  constructor(
    private io: Server,
    private notificationsRepository: INotificationsRepository,
    private tokenService: ITokenService
  ) {
    console.log("[NotificationService] Initializing NotificationService...");
    this.setupSocketEvents();
  }

  private setupSocketEvents() {
    console.log("[NotificationService] Setting up socket.io middleware & listeners...");

    // ---------------- SOCKET.IO MIDDLEWARE FOR AUTH ----------------
    this.io.use(async (socket, next) => {
      console.log(`[NotificationService] [Middleware] Incoming socket connection: ${socket.id}`);
      try {
        const cookies = cookie.parse(socket.handshake.headers.cookie || "");
        const token = cookies.userAccessToken;

        console.log("[NotificationService] [Middleware] Parsed cookies:", cookies);
        console.log("[NotificationService] [Middleware] Token found:", !!token);

         if (!token) {
          console.warn(`[NotificationService] ${ERRORMESSAGES.AUTH_USER_NOT_AUTHENTICATED.message} (socketId=${socket.id})`);
          return next(new Error(ERRORMESSAGES.AUTH_USER_NOT_AUTHENTICATED.message));
        }

        const payload = await this.tokenService.verifyAccessToken(token);
        console.log("[NotificationService] [Middleware] Decoded payload:", payload);

        if (!payload?.id) {
          console.warn(`[NotificationService] ${ERRORMESSAGES.AUTH_INVALID_ACCESS_TOKEN.message} (socketId=${socket.id})`);
          return next(new Error(ERRORMESSAGES.AUTH_INVALID_ACCESS_TOKEN.message));
        }

        socket.data.userId = payload.id;
        console.log(`[NotificationService] [Middleware] Auth success for userId=${payload.id} on socket ${socket.id}`);
        next();
      } catch (error) {
      console.error(`[NotificationService] [Middleware] Token verification failed for socket ${socket.id}:`, error);
        return next(new Error(ERRORMESSAGES.AUTH_INVALID_ACCESS_TOKEN.message));
      }
    });

    // ---------------- SOCKET CONNECTION ----------------
    this.io.on('connection', (socket: Socket) => {
      console.log(`[NotificationService] [Connection] Socket connected: ${socket.id} for userId=${socket.data.userId}`);

      // ---------------- USER JOINS THEIR ROOM ----------------
      socket.on('join', (userId: string) => {
        console.log(`[NotificationService] [Join] Socket ${socket.id} requested join for userId=${userId}`);

     if (socket.data.userId !== userId) {
          console.warn(`[NotificationService] ${ERRORMESSAGES.NOTIFICATION_UNAUTHORIZED.message} (socketId=${socket.id})`);
          socket.disconnect();
          return;
        }

        console.log(`[NotificationService] [Join] Authorized: user ${userId} joined room with socket ${socket.id}`);
        this.connectedUsers.set(userId, socket);
        socket.join(userId);

        const roomSize = this.io.sockets.adapter.rooms.get(userId)?.size || 0;
        console.log(`[NotificationService] [Join] Number of sockets in room ${userId}: ${roomSize}`);

        this.sendUnreadCount(userId);
      });

      // ---------------- USER MARKS NOTIFICATION AS READ ----------------
      socket.on('markNotificationRead', async (notificationId: string) => {
        console.log(`[NotificationService] [MarkRead] Marking notification ${notificationId} as read for socket ${socket.id}`);
       try {
        await this.notificationsRepository.markAsRead(notificationId);

        const userId = [...this.connectedUsers.entries()].find(
          ([, s]) => s.id === socket.id
        )?.[0];

        if (userId) {
            console.log(`[NotificationService] ${MESSAGES.NOTIFICATION_MARKED_READ} for userId=${userId}`);
            this.sendUnreadCount(userId);
          } else {
            console.warn(`[NotificationService] ${ERRORMESSAGES.NOTIFICATION_UNAUTHORIZED.message} (socketId=${socket.id})`);
          }
            } catch {
          console.error(`[NotificationService] ${ERRORMESSAGES.NOTIFICATION_MARK_READ_FAILED.message} (id=${notificationId})`);
        }
      });

      // ---------------- SOCKET DISCONNECT ----------------
      socket.on('disconnect', (reason) => {
        console.log(`[NotificationService] [Disconnect] Socket ${socket.id} disconnected. Reason: ${reason}`);
        for (const [userId, s] of this.connectedUsers.entries()) {
          if (s.id === socket.id) {
            this.connectedUsers.delete(userId);
            console.log(`[NotificationService] [Disconnect] Removed socket mapping for userId=${userId}`);
            const roomSizeAfter = this.io.sockets.adapter.rooms.get(userId)?.size || 0;
            console.log(`[NotificationService] [Disconnect] Number of sockets in room ${userId} after removal: ${roomSizeAfter}`);
            break;
          }
        }
      });
    });
  }

  // ---------------- SEND NOTIFICATION ----------------
  async sendNotification(notification: Notification) {
    console.log(`[NotificationService] [SendNotification] Preparing to send notification to userId=${notification.userId}`);

    const saved = await this.notificationsRepository.create(notification);

    const socketsInRoom = this.io.sockets.adapter.rooms.get(notification.userId);
    const roomSize = socketsInRoom?.size || 0;
    console.log(`[NotificationService] [SendNotification] Sockets in room ${notification.userId}: size=${roomSize}`, socketsInRoom);

    if (roomSize === 0) {
      console.warn(`[NotificationService] ${ERRORMESSAGES.NOTIFICATIONS_NOT_FOUND.message} (userId=${notification.userId})`);
    }

     this.io.to(notification.userId).emit('notification', saved.toJSON());
    console.log(`[NotificationService] ${MESSAGES.NOTIFICATIONS_FETCHED} for userId=${notification.userId}`);

    this.sendUnreadCount(notification.userId);
  }

  // ---------------- SEND UNREAD COUNT ----------------
  async sendUnreadCount(userId: string) {
    console.log(`[NotificationService] [SendUnreadCount] Counting unread notifications for userId=${userId}`);
    const count = await this.notificationsRepository.countUnreadByUserId(userId);
    this.io.to(userId).emit('unreadCount', count);
console.log(`[NotificationService] ${MESSAGES.NOTIFICATIONS_FETCHED} (count=${count}) for userId=${userId}`);
  }


  
  // ---------------- MARK AS READ & EMIT ----------------
  async markAsReadAndEmit(notificationId: string, userId: string) {
    try {
      await this.notificationsRepository.markAsRead(notificationId);
      this.io.to(userId).emit("notificationRead", { notificationId });
      await this.sendUnreadCount(userId);
      console.log(`[NotificationService] ${MESSAGES.NOTIFICATION_MARKED_READ} (id=${notificationId})`);
    } catch {
      console.error(`[NotificationService] ${ERRORMESSAGES.NOTIFICATION_MARK_READ_FAILED.message} (id=${notificationId})`);
    }
  }
}
