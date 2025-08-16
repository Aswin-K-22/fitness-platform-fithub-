// src/main.ts
import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import * as dotenv from 'dotenv';
import { composeApp } from '@/infra/composer/app.composer';
import prisma from '@/infra/databases/prismaClient';
import Redis from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';
import { NotificationService } from './infra/providers/notification.service';
import { NotificationsRepository } from './infra/repositories/notifications.repository';
import { JwtTokenService } from './infra/providers/jwtTokenService';
import { RedisService } from './infra/providers/redis.service';


dotenv.config();

const app = express();
const httpServer = createServer(app);

// ---------------- Socket.IO + Redis ----------------

const io = new Server(httpServer, {
  cors: {
    origin: process.env.ORIGIN,
    credentials: true,
  },
  transports: ['websocket'],
});
const pubClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));




app.use(morgan('[:date[iso]] :method :url :status :response-time ms'));
app.use(cors({
  origin: process.env.ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// Rate-limiting for /user/auth/signup
app.use('/api/user/auth/signup', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per IP
  message: { success: false, error: 'Too many signup attempts, try again later' },
}));

// Mount routes
const { userRoutes, trainerRoutes, adminRoutes, userNotificationService, trainerNotificationService } = composeApp();

app.use('/api/user', userRoutes.router);
app.use('/api/trainer', trainerRoutes.router);
app.use('/api/admin', adminRoutes.router);

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error:', err.stack);
  res.status(500).json({ message: 'Something went wrong on the server', error: err.message });
});



// ---------------- Start Server ----------------

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, httpServer, io };