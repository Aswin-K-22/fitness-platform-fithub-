import { UsersRepository } from '@/infra/repositories/users.repository';
import { TrainersRepository } from '@/infra/repositories/trainers.repository';
import { GymsRepository } from '@/infra/repositories/gyms.repository';
import { MembershipsPlanRepository } from '@/infra/repositories/membershipsPlan.repository';
import { MembershipsRepository } from '@/infra/repositories/memberships.repository';
import { PaymentsRepository } from '@/infra/repositories/payments.repository';
import { BcryptPasswordHasher } from '@/infra/providers/bcryptPasswordHasher';
import { GoogleAuthService } from '@/infra/providers/googleAuthService';
import { JwtTokenService } from '@/infra/providers/jwtTokenService';
import { RedisService } from '@/infra/providers/redis.service';
import { NodemailerEmailService } from '@/infra/providers/nodemailerEmailService';
import prisma from '@/infra/databases/prismaClient';
import { io } from '@/main';

// User Use Cases
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
import { UpdateUserProfileUseCase } from '@/app/useCases/updateUserProfile.useCase';
import { InitiateMembershipPaymentUseCase } from '@/app/useCases/initiateMembershipPayment.useCase';
import { VerifyMembershipPaymentUseCase } from '@/app/useCases/verifyMembershipPayment.useCase';
import { GetUserProfileUseCase } from '@/app/useCases/getUserProfile.useCase';
import { GetUsersUseCase } from '@/app/useCases/getUsers.useCase';
import { ToggleUserVerificationUseCase } from '@/app/useCases/toggleUserVerification.useCase';
import { GetGymsUseCase } from '@/app/useCases/getGyms.useCase';
import { GetAdminGymsUseCase } from '@/app/useCases/getAdminGyms.useCase';
import { AddGymUseCase } from '@/app/useCases/addGym.useCase';
import { GetAvailableTrainersUseCase } from '@/app/useCases/getAvailableTrainers.useCase';
import { GetAdminMembershipPlansUseCase } from '@/app/useCases/getAdminMembershipPlans.useCase';
import { AddMembershipPlanUseCase } from '@/app/useCases/addMembershipPlan.useCase';
import { GetTrainerProfileUseCase } from '@/app/useCases/getTrainerProfile.useCase';
import { UpdateTrainerProfileUseCase } from '@/app/useCases/updateTrainerProfile.useCase';

// Trainer Use Cases
import { CreateTrainerUseCase } from '@/app/useCases/createTrainer.useCase';
import { GetTrainerUseCase } from '@/app/useCases/getTrainer.useCase';
import { LoginTrainerUseCase } from '@/app/useCases/loginTrainer.useCase';
import { LogoutTrainerUseCase } from '@/app/useCases/logoutTrainer.useCase';
import { ResendTrainerOtpUseCase } from '@/app/useCases/resendOtpTrainer.useCase';
import { VerifyTrainerOtpUseCase } from '@/app/useCases/verifyTrainerOtp.useCase';
import { TrainerRefreshTokenUseCase } from '@/app/useCases/trainerRefreshToken.useCase';
import { GetTrainersUseCase } from '@/app/useCases/getTrainers.useCase';
import { ApproveTrainerUseCase } from '@/app/useCases/approveTrainer.useCase';

// Admin Use Cases
import { LoginAdminUseCase } from '@/app/useCases/loginAdmin.useCase';
import { GetAdminUseCase } from '@/app/useCases/getAdmin.useCase';
import { AdminRefreshTokenUseCase } from '@/app/useCases/adminRefreshToken.useCase';
import { LogoutAdminUseCase } from '@/app/useCases/logoutAdmin.useCase';

// Presentation
import { UserAuthController } from '@/presentation/controllers/user/auth.controller';
import { UserController } from '@/presentation/controllers/user/user.controller';
import { TrainerAuthController } from '@/presentation/controllers/trainer/auth.controller';
import { TrainerController } from '@/presentation/controllers/trainer/trainer.controller';
import { AdminAuthController } from '@/presentation/controllers/admin/adminAuth.controller';
import { AdminController } from '@/presentation/controllers/admin/admin.controller';
import { AuthMiddleware } from '@/presentation/middlewares/userAuth.middleware';
import { TrainerAuthMiddleware } from '@/presentation/middlewares/trainerAuth.middleware';
import { AdminAuthMiddleware } from '@/presentation/middlewares/adminAuth.middleware';
import { UserRoutes } from '@/presentation/routes/user.routes';
import { TrainerRoutes } from '@/presentation/routes/trainer.routes';
import { AdminRoutes } from '@/presentation/routes/admin.routes';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { NotificationService } from '../providers/notification.service';
import { GetNotificationsUseCase } from '@/app/useCases/getNotifications.useCase';
import { MarkNotificationReadUseCase } from '@/app/useCases/markNotificationRead.useCase';

export function composeApp() {
  // Repositories
  const usersRepository = new UsersRepository(prisma);
  const trainersRepository = new TrainersRepository(prisma);
  const gymsRepository = new GymsRepository(prisma);
  const membershipsPlanRepository = new MembershipsPlanRepository(prisma);
  const membershipsRepository = new MembershipsRepository(prisma);
  const paymentsRepository = new PaymentsRepository(prisma);
  const notificationsRepository = new NotificationsRepository(prisma);

  // Providers
  const passwordHasher = new BcryptPasswordHasher();
  const emailService = new NodemailerEmailService();
  const redisService = new RedisService();
  const tokenService = new JwtTokenService(redisService);
  const googleAuthService = new GoogleAuthService();
 const notificationService = new NotificationService(io, notificationsRepository, tokenService);

  // User Use Cases
  const createUserUseCase = new CreateUserUseCase(usersRepository, passwordHasher, emailService);
  const loginUserUseCase = new LoginUserUseCase(usersRepository, passwordHasher, tokenService);
  const logoutUserUseCase = new LogoutUserUseCase(usersRepository, tokenService);
  const googleAuthUseCase = new GoogleAuthUseCase(usersRepository, googleAuthService, tokenService);
  const refreshTokenUseCase = new RefreshTokenUseCase(usersRepository, tokenService);
  const resendOtpUseCase = new ResendOtpUseCase(usersRepository, emailService);
  const forgotPasswordUseCase = new ForgotPasswordUseCase(usersRepository, emailService);
  const verifyForgotPasswordOtpUseCase = new VerifyForgotPasswordOtpUseCase(usersRepository);
  const resetPasswordUseCase = new ResetPasswordUseCase(usersRepository, passwordHasher);
  const verifyUserOtpUseCase = new VerifyUserOtpUseCase(usersRepository, tokenService);
  const getUserUseCase = new GetUserUseCase(usersRepository);
  const getUserProfileUseCase = new GetUserProfileUseCase(usersRepository);
  const getGymsUseCase = new GetGymsUseCase(gymsRepository);
  const getGymDetailsUseCase = new GetGymDetailsUseCase(gymsRepository);
  const getMembershipPlansUseCase = new GetMembershipPlansUseCase(membershipsPlanRepository);
  const getAdminMembershipPlansUseCase = new GetAdminMembershipPlansUseCase(membershipsPlanRepository);
  const initiateMembershipPaymentUseCase = new InitiateMembershipPaymentUseCase(
    membershipsRepository,
    paymentsRepository,
    usersRepository,
    membershipsPlanRepository
  );
  const verifyMembershipPaymentUseCase = new VerifyMembershipPaymentUseCase(
    membershipsRepository,
    paymentsRepository,
    usersRepository,
    membershipsPlanRepository,
    notificationService
  );
  const updateUserProfileUseCase = new UpdateUserProfileUseCase(usersRepository);
  const getUsersUseCase = new GetUsersUseCase(usersRepository);
  const toggleUserVerificationUseCase = new ToggleUserVerificationUseCase(usersRepository);
  const getAdminGymsUseCase = new GetAdminGymsUseCase(gymsRepository);
  const addGymUseCase = new AddGymUseCase(gymsRepository, trainersRepository);
  const getAvailableTrainersUseCase = new GetAvailableTrainersUseCase(trainersRepository);
  const addMembershipPlanUseCase = new AddMembershipPlanUseCase(membershipsPlanRepository);
  const getTrainerProfileUseCase = new GetTrainerProfileUseCase(trainersRepository);
  const updateTrainerProfileUseCase = new UpdateTrainerProfileUseCase(trainersRepository);

  const getNotificationsUseCase = new GetNotificationsUseCase(notificationsRepository);
  const markNotificationReadUseCase = new MarkNotificationReadUseCase(notificationsRepository)

  // Trainer Use Cases
  const createTrainerUseCase = new CreateTrainerUseCase(trainersRepository, passwordHasher, emailService);
  const loginTrainerUseCase = new LoginTrainerUseCase(trainersRepository, passwordHasher, tokenService);
  const logoutTrainerUseCase = new LogoutTrainerUseCase(trainersRepository, tokenService);
  const verifyTrainerOtpUseCase = new VerifyTrainerOtpUseCase(trainersRepository);
  const resendTrainerOtpUseCase = new ResendTrainerOtpUseCase(trainersRepository, emailService);
  const getTrainerUseCase = new GetTrainerUseCase(trainersRepository);
  const trainerRefreshTokenUseCase = new TrainerRefreshTokenUseCase(trainersRepository, tokenService);
  const getTrainersUseCase = new GetTrainersUseCase(trainersRepository);
  const approveTrainerUseCase = new ApproveTrainerUseCase(trainersRepository);

  // Admin Use Cases
  const loginAdminUseCase = new LoginAdminUseCase(usersRepository, passwordHasher, tokenService);
  const getAdminUseCase = new GetAdminUseCase(usersRepository);
  const adminRefreshTokenUseCase = new AdminRefreshTokenUseCase(usersRepository, tokenService);
  const logoutAdminUseCase = new LogoutAdminUseCase(usersRepository, tokenService);

  // Middlewares
  const authMiddleware = new AuthMiddleware(usersRepository, tokenService);
  const trainerAuthMiddleware = new TrainerAuthMiddleware(trainersRepository, tokenService);
  const adminAuthMiddleware = new AdminAuthMiddleware(usersRepository, tokenService);

  // Controllers
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
    updateUserProfileUseCase,
    getNotificationsUseCase,
    markNotificationReadUseCase
  );
  const trainerAuthController = new TrainerAuthController(
    createTrainerUseCase,
    loginTrainerUseCase,
    logoutTrainerUseCase,
    verifyTrainerOtpUseCase,
    resendTrainerOtpUseCase,
    trainerRefreshTokenUseCase
  );
  const trainerController = new TrainerController(getTrainerUseCase, getTrainerProfileUseCase, updateTrainerProfileUseCase);
  const adminAuthController = new AdminAuthController(loginAdminUseCase, adminRefreshTokenUseCase, logoutAdminUseCase);
  const adminController = new AdminController(
    getAdminUseCase,
    getUsersUseCase,
    toggleUserVerificationUseCase,
    getTrainersUseCase,
    approveTrainerUseCase,
    getAdminGymsUseCase,
    addGymUseCase,
    getAvailableTrainersUseCase,
    getAdminMembershipPlansUseCase,
    addMembershipPlanUseCase
  );

  // Routes
  const userRoutes = new UserRoutes(userAuthController, userController, authMiddleware);
  const trainerRoutes = new TrainerRoutes(trainerAuthController, trainerController, trainerAuthMiddleware);
  const adminRoutes = new AdminRoutes(adminAuthController, adminController, adminAuthMiddleware, usersRepository, tokenService);

  return {
    userRoutes,
    trainerRoutes,
    adminRoutes,
  };
}