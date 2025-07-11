// External Libraries
// src/main.ts
import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import multer from 'multer';
import rateLimit from 'express-rate-limit';

// Config / Environment
import * as dotenv from 'dotenv';
dotenv.config();
import env from '@/infra/utils/env';
console.log(env.DATABASE_URL);


























// Infrastructure - Repositories & Providers
import prisma from '@/infra/databases/prismaClient';
import { UsersRepository } from '@/infra/repositories/users.repository';
import { TrainersRepository } from '@/infra/repositories/trainers.repository';
import { GymsRepository} from '@/infra/repositories/gyms.repository';
import { BcryptPasswordHasher } from '@/infra/providers/bcryptPasswordHasher';
import { GoogleAuthService } from '@/infra/providers/googleAuthService';
import { JwtTokenService } from '@/infra/providers/jwtTokenService';
import { NodemailerEmailService } from '@/infra/providers/nodemailerEmailService';
import { MembershipsPlanRepository } from '@/infra/repositories/membershipsPlan.repository';



// Application Use Cases - User
import { CreateUserUseCase } from '@/app/useCases/createUser.useCase';
import { ForgotPasswordUseCase } from '@/app/useCases/forgotPassword.useCase';
import { GetUserUseCase } from '@/app/useCases/getUser.useCase';
import { GoogleAuthUseCase } from '@/app/useCases/googleAuth.useCase';
import { LoginUserUseCase } from '@/app/useCases/loginUser.useCase';
import { LogoutUserUseCase } from '@/app/useCases/logoutUser.useCase';
import { RefreshTokenUseCase } from '@/app/useCases/refreshToken.useCase';
import { ResendOtpUseCase } from '@/app/useCases/resendOtp.useCase';
import { ResetPasswordUseCase } from '@/app/useCases/resetPassword.useCase';
import { VerifyForgotPasswordOtpUseCase } from '@/app/useCases/verifyForgotPasswordOtp.useCase';
import { VerifyUserOtpUseCase } from '@/app/useCases/verifyUserOtp.useCase';
import { GetGymDetailsUseCase } from '@/app/useCases/getGymDetails.useCase';
import { GetMembershipPlansUseCase } from '@/app/useCases/getMembershipPlans.useCase';
import { UpdateUserProfileUseCase } from './app/useCases/updateUserProfile.useCase';


// Application Use Cases - Trainer
import { CreateTrainerUseCase } from '@/app/useCases/createTrainer.useCase';
import { GetTrainerUseCase } from '@/app/useCases/getTrainer.useCase';
import { LoginTrainerUseCase } from '@/app/useCases/loginTrainer.useCase';
import { LogoutTrainerUseCase } from '@/app/useCases/logoutTrainer.useCase';
import { ResendTrainerOtpUseCase } from '@/app/useCases/resendOtpTrainer.useCase';
import { VerifyTrainerOtpUseCase } from '@/app/useCases/verifyTrainerOtp.useCase';
import { TrainerRefreshTokenUseCase } from '@/app/useCases/trainerRefreshToken.useCase';



// Application Use Cases - Admin
import { LoginAdminUseCase } from '@/app/useCases/loginAdmin.useCase';
import { GetAdminUseCase } from '@/app/useCases/getAdmin.useCase';
import { AdminRefreshTokenUseCase } from '@/app/useCases/adminRefreshToken.useCase';
import {  GetAdminMembershipPlansUseCase} from '@/app/useCases/getAdminMembershipPlans.useCase';

// Presentation - Controllers
import { TrainerAuthController } from '@/presentation/controllers/trainer/auth.controller';
import { TrainerController } from '@/presentation/controllers/trainer/trainer.controller';
import { UserAuthController } from '@/presentation/controllers/user/auth.controller';
import { UserController } from '@/presentation/controllers/user/user.controller';


// Presentation - Admin 
import { AdminAuthController } from '@/presentation/controllers/admin/adminAuth.controller';
import { AdminController } from '@/presentation/controllers/admin/admin.controller';
import { AdminAuthMiddleware } from '@/presentation/middlewares/adminAuth.middleware';
import { AdminRoutes } from '@/presentation/routes/admin.routes';


// Presentation - Middlewares
import { AuthMiddleware } from '@/presentation/middlewares/userAuth.middleware';
import { TrainerAuthMiddleware } from '@/presentation/middlewares/trainerAuth.middleware';

// Presentation - Routes
import { TrainerRoutes } from '@/presentation/routes/trainer.routes';
import { UserRoutes } from '@/presentation/routes/user.routes';
import { GetGymsUseCase } from './app/useCases/getGyms.useCase';
import { MembershipsRepository } from './infra/repositories/memberships.repository';
import { PaymentsRepository } from './infra/repositories/payments.repository';
import { InitiateMembershipPaymentUseCase } from './app/useCases/initiateMembershipPayment.useCase';
import { VerifyMembershipPaymentUseCase } from './app/useCases/verifyMembershipPayment.useCase';
import { GetUserProfileUseCase } from './app/useCases/getUserProfile.useCase';
import { LogoutAdminUseCase } from './app/useCases/logoutAdmin.useCase';
import { GetUsersUseCase } from './app/useCases/getUsers.useCase';
import { ToggleUserVerificationUseCase } from './app/useCases/toggleUserVerification.useCase';
import { GetTrainersUseCase } from './app/useCases/getTrainers.useCase';
import { ApproveTrainerUseCase } from './app/useCases/approveTrainer.useCase';
import { GetAdminGymsUseCase } from './app/useCases/getAdminGyms.useCase';
import { AddGymUseCase } from './app/useCases/addGym.useCase';
import { GetAvailableTrainersUseCase } from './app/useCases/getAvailableTrainers.useCase';
import { AddMembershipPlanUseCase } from './app/useCases/addMembershipPlan.useCase';
import { GetTrainerProfileUseCase } from './app/useCases/getTrainerProfile.useCase';
import { UpdateTrainerProfileUseCase } from './app/useCases/updateTrainerProfile.useCase';


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});

app.use(morgan('[:date[iso]] :method :url :status :response-time ms'));
// app.use((req, res, next) => {
//   console.log(`Incoming request: ${req.method} ${req.url}, Body:`, req.body);
//   next();
// });
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('uploads'));


// Rate-limiting for /user/auth/signup (Recommendation 4)
app.use('/api/user/auth/signup', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per IP
  message: { success: false, error: 'Too many signup attempts, try again later' },
}));

// Dependency Injection (Manual)
const usersRepository = new UsersRepository(prisma);
const trainersRepository = new TrainersRepository(prisma);
const gymsRepository = new GymsRepository(prisma);
const membershipsPlanRepository = new MembershipsPlanRepository(prisma);
const membershipsRepository = new MembershipsRepository(prisma);
const paymentsRepository = new PaymentsRepository(prisma);
const passwordHasher = new BcryptPasswordHasher();
const emailService = new NodemailerEmailService();
const tokenService = new JwtTokenService();
const googleAuthService = new GoogleAuthService();

// User Use Cases
const createUserUseCase = new CreateUserUseCase(usersRepository, passwordHasher, emailService);
const loginUserUseCase = new LoginUserUseCase(usersRepository, passwordHasher, tokenService);
const logoutUserUseCase = new LogoutUserUseCase(usersRepository);
const googleAuthUseCase = new GoogleAuthUseCase(usersRepository, googleAuthService,tokenService, );
const refreshTokenUseCase = new RefreshTokenUseCase(usersRepository, tokenService);
const resendOtpUseCase = new ResendOtpUseCase(usersRepository, emailService);
const forgotPasswordUseCase = new ForgotPasswordUseCase(usersRepository, emailService);
const verifyForgotPasswordOtpUseCase = new VerifyForgotPasswordOtpUseCase(usersRepository);
const resetPasswordUseCase = new ResetPasswordUseCase(usersRepository, passwordHasher);
const verifyUserOtpUseCase = new VerifyUserOtpUseCase(usersRepository,tokenService);
const getUserUseCase = new GetUserUseCase(usersRepository);
const getUserProfileUseCase = new GetUserProfileUseCase(usersRepository)
const getGymsUseCase = new GetGymsUseCase(gymsRepository);
const getGymDetailsUseCase = new GetGymDetailsUseCase(gymsRepository);
const getMembershipPlansUseCase = new GetMembershipPlansUseCase(membershipsPlanRepository);
const getAdminMembershipPlansUseCase = new GetAdminMembershipPlansUseCase(membershipsPlanRepository);
const initiateMembershipPaymentUseCase = new InitiateMembershipPaymentUseCase(membershipsRepository,paymentsRepository,usersRepository,membershipsPlanRepository)
const verifyMembershipPaymentUseCase = new VerifyMembershipPaymentUseCase(membershipsRepository,paymentsRepository,usersRepository,membershipsPlanRepository);
const updateUserProfileUseCase = new UpdateUserProfileUseCase(usersRepository);
const logoutAdminUseCase = new LogoutAdminUseCase(usersRepository);

const getTrainersUseCase = new GetTrainersUseCase(trainersRepository);
const approveTrainerUseCase = new ApproveTrainerUseCase(trainersRepository);
const getAdminGymsUseCase = new GetAdminGymsUseCase(gymsRepository);
const addGymUseCase = new AddGymUseCase(gymsRepository, trainersRepository);
const getAvailableTrainersUseCase = new GetAvailableTrainersUseCase(trainersRepository);



// Trainer Use Cases
const createTrainerUseCase = new CreateTrainerUseCase(trainersRepository, passwordHasher, emailService);
const loginTrainerUseCase = new LoginTrainerUseCase(trainersRepository, passwordHasher, tokenService);
const logoutTrainerUseCase = new LogoutTrainerUseCase(trainersRepository);
const verifyTrainerOtpUseCase = new VerifyTrainerOtpUseCase(trainersRepository);
const resendTrainerOtpUseCase = new ResendTrainerOtpUseCase(trainersRepository, emailService);
const getTrainerUseCase = new GetTrainerUseCase(trainersRepository);
const trainerRefreshTokenUseCase = new TrainerRefreshTokenUseCase(trainersRepository, tokenService);
const getTrainerProfileUseCase = new GetTrainerProfileUseCase(trainersRepository);
const updateTrainerProfileUseCase = new UpdateTrainerProfileUseCase(trainersRepository);

// Admin use Case
const loginAdminUseCase = new LoginAdminUseCase(usersRepository, passwordHasher, tokenService);
const getAdminUseCase = new GetAdminUseCase(usersRepository);
const adminRefreshTokenUseCase = new AdminRefreshTokenUseCase(usersRepository, tokenService);
const getUsersUseCase = new GetUsersUseCase(usersRepository);
const toggleUserVerificationUseCase = new ToggleUserVerificationUseCase(usersRepository);
const addMembershipPlanUseCase = new AddMembershipPlanUseCase(membershipsPlanRepository);







// Presentation
const authMiddleware = new AuthMiddleware(usersRepository, tokenService);
const trainerAuthMiddleware = new TrainerAuthMiddleware(trainersRepository,tokenService);
const adminAuthMiddleware = new AdminAuthMiddleware(usersRepository, tokenService);


const userAuthController = new UserAuthController(
  createUserUseCase,
  loginUserUseCase,
  logoutUserUseCase,
  googleAuthUseCase,
  refreshTokenUseCase,
  resendOtpUseCase,
  forgotPasswordUseCase,
  verifyForgotPasswordOtpUseCase,
  resetPasswordUseCase,
  verifyUserOtpUseCase
);


const userController = new UserController(
  getUserUseCase,
  getGymsUseCase,
  getGymDetailsUseCase,
  getMembershipPlansUseCase,
  initiateMembershipPaymentUseCase,
  verifyMembershipPaymentUseCase,
  getUserProfileUseCase,
  updateUserProfileUseCase 
);
const trainerAuthController = new TrainerAuthController(
  createTrainerUseCase,
  loginTrainerUseCase,
  logoutTrainerUseCase,
  verifyTrainerOtpUseCase,
  resendTrainerOtpUseCase,
    trainerRefreshTokenUseCase
);
const trainerController = new TrainerController(getTrainerUseCase,getTrainerProfileUseCase,updateTrainerProfileUseCase);


const adminAuthController = new AdminAuthController(loginAdminUseCase, adminRefreshTokenUseCase,logoutAdminUseCase );
const adminController = new AdminController(
  getAdminUseCase,
  getUsersUseCase,
  toggleUserVerificationUseCase,
  getTrainersUseCase,
  approveTrainerUseCase,
  getAdminGymsUseCase, addGymUseCase, getAvailableTrainersUseCase, getAdminMembershipPlansUseCase,addMembershipPlanUseCase
);


// Routes
const userRoutes = new UserRoutes(userAuthController, userController, authMiddleware);
const trainerRoutes = new TrainerRoutes(trainerAuthController, trainerController, trainerAuthMiddleware);

const adminRoutes = new AdminRoutes(adminAuthController, adminController, adminAuthMiddleware, usersRepository, tokenService);

// Mount routes
app.use('/api/user', userRoutes.router);
app.use('/api/trainer', trainerRoutes.router);
app.use('/api/admin', adminRoutes.router);

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error:', err.stack);
  res.status(500).json({ message: 'Something went wrong on the server', error: err.message });
});

// Socket.io
io.on('connection', (socket) => {
  console.log('User connected');
});

const PORT = process.env.PORT ;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, httpServer, io };