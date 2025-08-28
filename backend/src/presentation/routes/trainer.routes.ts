//src/presentation/rotes/trainer.rotes.ts

import { Router } from 'express';
import { validateMiddleware } from '../middlewares/trainer/trainer.validate.middleware';
import { refreshTokenMiddleware } from '../middlewares/trainer/trainerRefreshToken.middleware';
import { ITrainerValidationMiddleware } from '@/app/middlewares/interfaces/trainer/ITrainerValidationMiddleware';
import { upload } from '@/infra/config/multerS3';
import { ITrainerAuthController } from '@/app/controllers/interfaces/trainer/ITrainerAuthController';
import { ITrainerController } from '@/app/controllers/interfaces/trainer/ITrainerController';
import { ITrainerAuthMiddleware } from '@/app/middlewares/interfaces/trainer/ITrainerAuthMiddleware';
import { ChatController } from '../controllers/chat/chatController';

export class TrainerRoutes {
  public router: Router;

  constructor(
    private trainerAuthController: ITrainerAuthController,
    private trainerController: ITrainerController,
    private trainerAuthMiddleware: ITrainerAuthMiddleware,
   private trainerValidationMiddleware: ITrainerValidationMiddleware,
     private chatController: ChatController,

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
     
      this.trainerAuthController.resendOtp.bind(this.trainerAuthController)
    );
    this.router.post(
      '/auth/login',
      //validateMiddleware('loginTrainer'),
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
      this.trainerController.getTrainerProfile.bind(this.trainerController)
    );

  this.router.put(
  '/profile',
  this.trainerAuthMiddleware.auth.bind(this.trainerAuthMiddleware),
  upload.single('profilePic'),
  this.trainerValidationMiddleware.validateUpdateTrainerProfile.bind(this.trainerValidationMiddleware),
  this.trainerController.updateTrainerProfile.bind(this.trainerController)
);

       this.router.get(
      '/auth/get',
      this.trainerAuthMiddleware.auth.bind(this.trainerAuthMiddleware),
      this.trainerController.getTrainer.bind(this.trainerController)
    );

   this.router.post(
      '/create-plan',
      this.trainerAuthMiddleware.auth.bind(this.trainerAuthMiddleware),
      upload.single('image'),
      this.trainerValidationMiddleware.validateCreatePTPlan.bind(this.trainerValidationMiddleware),
      this.trainerController.createPTPlan.bind(this.trainerController)
    );

     this.router.get(
      '/plans',
      this.trainerAuthMiddleware.auth.bind(this.trainerAuthMiddleware),
      this.trainerValidationMiddleware.validateGetPTPlans.bind(this.trainerValidationMiddleware),
      this.trainerController.getPTPlans.bind(this.trainerController)
    );

    this.router.put(
      '/plans/:id',
     this.trainerAuthMiddleware.auth.bind(this.trainerAuthMiddleware),
      upload.single('image'),
      this.trainerValidationMiddleware.validateEditPTPlan.bind(this.trainerValidationMiddleware),
      this.trainerController.editPTPlan.bind(this.trainerController)
    );

this.router.patch(
  '/plans/:planId/stop',
  this.trainerAuthMiddleware.auth.bind(this.trainerAuthMiddleware),
  this.trainerValidationMiddleware.validateStopPTPlan.bind(this.trainerValidationMiddleware),
  this.trainerController.stopPTPlan.bind(this.trainerController)
);

this.router.patch(
  '/plans/:planId/resume',
  this.trainerAuthMiddleware.auth.bind(this.trainerAuthMiddleware),
  this.trainerValidationMiddleware.validateResumePTPlan.bind(this.trainerValidationMiddleware),
  this.trainerController.resumePTPlan.bind(this.trainerController)
);


    this.router.post(
      '/refresh-token',
      refreshTokenMiddleware,
     // validateMiddleware('refreshToken'),
      this.trainerAuthController.refreshToken.bind(this.trainerAuthController)
    );
    // this.router.get('/trainer/profile', this.trainerAuthMiddleware.auth.bind(this.trainerAuthMiddleware), this.trainerController.getTrainer.bind(this.trainerController));

    this.router.get(
  '/notifications',
 this.trainerAuthMiddleware.auth.bind(this.trainerAuthMiddleware),
  this.trainerController.getTrainerNotifications.bind(this.trainerController)
);

this.router.post(
  '/notifications/:notificationId/read',
  this.trainerAuthMiddleware.auth.bind(this.trainerAuthMiddleware),
  this.trainerController.markTrainerNotificationRead.bind(this.trainerController)
);

this.router.get(
      '/users-pt-plans',
      this.trainerAuthMiddleware.auth.bind(this.trainerAuthMiddleware),
      this.trainerController.getUsersForTrainerPlans.bind(this.trainerController)
);

// GET /conversations/:id/messages?before=msg789&limit=20   // older messages
// GET /conversations/:id/messages?after=msg123&limit=20    // newer messages
// GET /conversations/:id/messages?limit=20                 // latest messages

this.router.get(
  '/chat/conversations/:id/messages',
  this.trainerAuthMiddleware.auth.bind(this.trainerAuthMiddleware),
  this.chatController.getConversationMessagesChatHistory.bind(this.chatController)
);


// trainer.routes.ts
this.router.get(
  '/chat/conversations/summary',
  this.trainerAuthMiddleware.auth.bind(this.trainerAuthMiddleware),
  this.chatController.getChatSummary.bind(this.chatController)
);
    
  }
}