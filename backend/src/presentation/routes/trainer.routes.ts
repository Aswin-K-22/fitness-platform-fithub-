import { Router } from 'express';
import { TrainerAuthController } from '../controllers/trainer/auth.controller';
import { TrainerController } from '../controllers/trainer/trainer.controller';
import { TrainerAuthMiddleware } from '../middlewares/trainerAuth.middleware';
import { validateMiddleware } from '../middlewares/trainer.validate.middleware';
import { upload } from '../../infra/config/multer';
import { refreshTokenMiddleware } from '../middlewares/trainerRefreshToken.middleware';

export class TrainerRoutes {
  public router: Router;

  constructor(
    private trainerAuthController: TrainerAuthController,
    private trainerController: TrainerController,
    private trainerAuthMiddleware: TrainerAuthMiddleware
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    console.log('Setting up trainer routes');
    this.router.post(
      '/auth/signup',
      upload.fields([{ name: 'certifications[0][file]', maxCount: 10 }]),
      validateMiddleware('signupTrainer'),
      this.trainerAuthController.signup.bind(this.trainerAuthController)
    );
    this.router.post(
      '/verify-otp',
      validateMiddleware('verifyTrainerOtp'),
      this.trainerAuthController.verifyOtp.bind(this.trainerAuthController)
    );
    this.router.post(
      '/auth/resend-otp',
      validateMiddleware('resendTrainerOtp'),
      this.trainerAuthController.resendOtp.bind(this.trainerAuthController)
    );
    this.router.post(
      '/auth/login',
      validateMiddleware('loginTrainer'),
      this.trainerAuthController.login.bind(this.trainerAuthController)
    );
    this.router.post(
      '/auth/logout',
      this.trainerAuthMiddleware.auth.bind(this.trainerAuthMiddleware),
      validateMiddleware('logoutTrainer'),
      this.trainerAuthController.logout.bind(this.trainerAuthController)
    );
    this.router.get(
      '/profile',
      this.trainerAuthMiddleware.auth.bind(this.trainerAuthMiddleware),
      this.trainerController.getTrainer.bind(this.trainerController)
    );

       this.router.get(
      '/auth/get',
      this.trainerAuthMiddleware.auth.bind(this.trainerAuthMiddleware),
      this.trainerController.getTrainer.bind(this.trainerController)
    );
    this.router.post(
      '/refresh-token',
      refreshTokenMiddleware,
      validateMiddleware('refreshToken'),
      this.trainerAuthController.refreshToken.bind(this.trainerAuthController)
    );
     this.router.get('/trainer/profile', this.trainerAuthMiddleware.auth.bind(this.trainerAuthMiddleware), this.trainerController.getTrainer.bind(this.trainerController));

  }
}