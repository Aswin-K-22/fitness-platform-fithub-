import { Router } from 'express';
import { UserAuthController } from '../controllers/user/auth.controller';
import { UserController } from '../controllers/user/user.controller';
import { AuthMiddleware } from '../middlewares/userAuth.middleware';
import { validateMiddleware } from '../middlewares/validate.middleware';
import { JwtTokenService } from '@/infra/providers/jwtTokenService';
import { refreshTokenMiddleware } from '../middlewares/refreshToken.middleware';
export class UserRoutes {
  public router: Router;

  constructor(
    private userAuthController: UserAuthController,
    private userController: UserController,
    private authMiddleware: AuthMiddleware,
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
    this.router.post('/auth/forgot-password', validateMiddleware('forgotPassword'), this.userAuthController.forgotPassword.bind(this.userAuthController));
    this.router.post('/auth/verify-forgot-password-otp', validateMiddleware('verifyOtp'), this.userAuthController.verifyForgotPasswordOtp.bind(this.userAuthController));
    this.router.post('/auth/reset-password', validateMiddleware('resetPassword'), this.userAuthController.resetPassword.bind(this.userAuthController));
    this.router.post('/auth/verify-otp', validateMiddleware('verifyOtp'), this.userAuthController.verifyOtp.bind(this.userAuthController));


    this.router.get('/gyms', this.userController.getGyms.bind(this.userController));
    // Protected routes
    this.router.post('/logout', this.authMiddleware.auth.bind(this.authMiddleware), validateMiddleware('logout'), this.userAuthController.logout.bind(this.userAuthController));
    this.router.post('/auth/refresh-token',  refreshTokenMiddleware,validateMiddleware('refreshToken'), this.userAuthController.refreshToken.bind(this.userAuthController));
    this.router.get('/auth/get', this.authMiddleware.auth.bind(this.authMiddleware), this.userController.getUser.bind(this.userController));
  
  
  }
}