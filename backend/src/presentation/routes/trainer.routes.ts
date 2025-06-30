import { Router } from 'express';
import { TrainerAuthController } from '../controllers/trainer/auth.controller';
import { TrainerController } from '../controllers/trainer/trainer.controller';
import { TrainerAuthMiddleware } from '../middlewares/trainerAuth.middleware';
import { validateMiddleware } from '../middlewares/validate.middleware';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

export class TrainerRoutes {
  public router: Router;

  constructor(
    private trainerAuthController: TrainerAuthController,
    private trainerController: TrainerController,
    private trainerAuthMiddleware: TrainerAuthMiddleware,
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Public routes
        console.log('Setting up trainer routes');
    this.router.post(
      '/auth/trainer/signup',
      upload.fields([{ name: 'certifications[0][file]', maxCount: 10 }]),
      validateMiddleware('signupTrainer'),
      this.trainerAuthController.signup.bind(this.trainerAuthController)
    );
    this.router.post('/auth/trainer/login', validateMiddleware('loginTrainer'), this.trainerAuthController.login.bind(this.trainerAuthController));
    this.router.post('/auth/trainer/verify-otp', validateMiddleware('verifyTrainerOtp'), this.trainerAuthController.verifyOtp.bind(this.trainerAuthController));
    this.router.post('/auth/trainer/resend-otp', validateMiddleware('resendTrainerOtp'), this.trainerAuthController.resendOtp.bind(this.trainerAuthController));
    this.router.get('/auth/get',this.trainerAuthMiddleware.auth.bind(this.trainerAuthMiddleware),this.trainerController.getTrainer.bind(this.trainerController));
    // Protected routes
    this.router.post(
      '/trainer/logout',
      this.trainerAuthMiddleware.auth.bind(this.trainerAuthMiddleware),
      validateMiddleware('logoutTrainer'),
      this.trainerAuthController.logout.bind(this.trainerAuthController)
    );
    this.router.get('/trainer/profile', this.trainerAuthMiddleware.auth.bind(this.trainerAuthMiddleware), this.trainerController.getTrainer.bind(this.trainerController));
  }
}