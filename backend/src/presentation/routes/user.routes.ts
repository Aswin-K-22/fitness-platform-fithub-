//src/presentation/rotes/user.tores
import { Router } from 'express';
import { validateMiddleware } from '../middlewares/user/validate.middleware';
import { refreshTokenMiddleware } from '../middlewares/user/userRefreshToken.middleware';
import { upload } from '@/infra/config/multer';
import { IUserController } from '@/app/controllers/interfaces/user/IUserController';
import { IUserAuthController } from '@/app/controllers/interfaces/user/IUserAuthController';
import { IUserAuthMiddleware } from '@/app/middlewares/interfaces/user/IUserAuthMiddleware';
export class UserRoutes {
  public router: Router;

  constructor(
    private userAuthController: IUserAuthController,
    private userController: IUserController,
    private authMiddleware: IUserAuthMiddleware,
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Public routes
    console.log('Setting up user routes');
    this.router.post('/auth/signup', validateMiddleware('signup'), this.userAuthController.signup.bind(this.userAuthController));
    this.router.post('/auth/login', validateMiddleware('login'), this.userAuthController.login.bind(this.userAuthController));
    this.router.post('/auth/google', validateMiddleware('googleAuth'), this.userAuthController.googleAuth.bind(this.userAuthController));
    this.router.post('/auth/resend-otp', validateMiddleware('resendOtp'), this.userAuthController.resendOtp.bind(this.userAuthController));
    this.router.post('/forgot-password', validateMiddleware('forgotPassword'), this.userAuthController.forgotPassword.bind(this.userAuthController));
    this.router.post('/auth/verify-forgot-password-otp', validateMiddleware('verifyOtp'), this.userAuthController.verifyForgotPasswordOtp.bind(this.userAuthController));
    this.router.post('/reset-password', validateMiddleware('resetPassword'), this.userAuthController.resetPassword.bind(this.userAuthController));
    this.router.post('/auth/verify-otp', validateMiddleware('verifyOtp'), this.userAuthController.verifyOtp.bind(this.userAuthController));


    this.router.get('/gyms', this.userController.getGyms.bind(this.userController));
    this.router.get('/gyms/:gymId', this.userController.getGymDetails.bind(this.userController));
    this.router.get('/membership-plans', this.userController.getMembershipPlans.bind(this.userController));
         
    this.router.post('/membership/payment', this.authMiddleware.auth.bind(this.authMiddleware), this.userController.initiateMembershipPayment.bind(this.userController));
    this.router.post('/membership/verify-payment', this.authMiddleware.auth.bind(this.authMiddleware),this.userController.verifyMembershipPayment.bind(this.userController));
    // Protected routes
    this.router.post('/logout', this.authMiddleware.auth.bind(this.authMiddleware), validateMiddleware('logout'), this.userAuthController.logout.bind(this.userAuthController));
    this.router.post('/auth/refresh-token',  refreshTokenMiddleware, this.userAuthController.refreshToken.bind(this.userAuthController));
    this.router.get('/auth/get', this.authMiddleware.auth.bind(this.authMiddleware), this.userController.getUser.bind(this.userController));
   this.router.get('/profile', this.authMiddleware.auth.bind(this.authMiddleware), this.userController.getUserProfile.bind(this.userController));
  this.router.put(
  '/profile',
  this.authMiddleware.auth.bind(this.authMiddleware),
  upload.single('profilePic'),
  this.userController.updateUserProfile.bind(this.userController)
);

this.router.get(
      '/notifications',
      this.authMiddleware.auth.bind(this.authMiddleware),
      this.userController.getNotifications.bind(this.userController)
    );
    this.router.post(
      '/notifications/:notificationId/read',
      this.authMiddleware.auth.bind(this.authMiddleware),
      this.userController.markNotificationRead.bind(this.userController)
    );
    this.router.post(
      '/membership/verify-payment',
      this.authMiddleware.auth.bind(this.authMiddleware),
      this.userController.verifyMembershipPayment.bind(this.userController)
    );
  }
}