//src/presentation/rotes/admin.rotes.ts

import { Router } from 'express';
import { validateMiddleware } from '@/presentation/middlewares/admin/admin.validate.middleware';
import { upload } from '@/infra/config/multer';
import { IAdminValidationMiddleware } from '@/app/middlewares/interfaces/admin/IAdminValidationMiddleware';
import { IAdminAuthController } from '@/app/controllers/interfaces/admin/IAdminAuthController';
import { IAdminController } from '@/app/controllers/interfaces/admin/IAdminController';
import { IAdminAuthMiddleware } from '@/app/middlewares/interfaces/admin/IAdminAuthMiddleware';

export class AdminRoutes {
  public router: Router;

  constructor(
    private adminAuthController: IAdminAuthController,
    private adminController: IAdminController,
    private adminAuthMiddleware: IAdminAuthMiddleware,
     private adminValidationMiddleware: IAdminValidationMiddleware
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    console.log('Setting up admin routes');
    this.router.post('/auth/login', validateMiddleware('adminLogin'), this.adminAuthController.login.bind(this.adminAuthController));
    this.router.post('/auth/logout', this.adminAuthMiddleware.auth.bind(this.adminAuthMiddleware),  this.adminAuthController.logout.bind(this.adminAuthController));

    this.router.post('/auth/refresh-token', this.adminAuthController.refreshToken.bind(this.adminAuthController));
    this.router.get('/auth/get', this.adminAuthMiddleware.auth.bind(this.adminAuthMiddleware), this.adminController.getAdmin.bind(this.adminController));
    this.router.get(
      '/users',
      this.adminAuthMiddleware.auth.bind(this.adminAuthMiddleware),
      this.adminController.getUsers.bind(this.adminController),
    );
    this.router.put(
      '/users/:userId/toggle-verification',
      this.adminAuthMiddleware.auth.bind(this.adminAuthMiddleware),
      this.adminController.toggleUserVerification.bind(this.adminController),
    );

   this.router.get(
  '/trainers',
  this.adminAuthMiddleware.auth.bind(this.adminAuthMiddleware),
  this.adminValidationMiddleware.validateGetTrainers.bind(this.adminValidationMiddleware),
  this.adminController.getTrainers.bind(this.adminController),
);
    this.router.put(
      '/trainers/:trainerId/toggle-approval',
      this.adminAuthMiddleware.auth.bind(this.adminAuthMiddleware),
    
      this.adminController.approveTrainer.bind(this.adminController),
    );
    this.router.get(
      '/gyms',
      this.adminAuthMiddleware.auth.bind(this.adminAuthMiddleware),
     
      this.adminController.getGyms.bind(this.adminController)
    );
     this.router.post('/addGym', this.adminAuthMiddleware.auth.bind(this.adminAuthMiddleware), upload.array('images'), this.adminController.addGym.bind(this.adminController));
      this.router.get('/available-trainers', this.adminAuthMiddleware.auth.bind(this.adminAuthMiddleware), this.adminController.getAvailableTrainers.bind(this.adminController));
      this.router.get(
      '/membership-plans',
      this.adminAuthMiddleware.auth.bind(this.adminAuthMiddleware),
      validateMiddleware('getAdminMembershipPlans'),
      this.adminController.getMembershipPlans.bind(this.adminController)
      
    );
    this.router.post(
      '/membership-plans',
      this.adminAuthMiddleware.auth.bind(this.adminAuthMiddleware),
      validateMiddleware('addMembershipPlan'),
      this.adminController.addMembershipPlan.bind(this.adminController)
    );

    this.router.get(
  '/plans',
  this.adminAuthMiddleware.auth.bind(this.adminAuthMiddleware),
  this.adminValidationMiddleware.validateGetTrainerPTPlans.bind(this.adminValidationMiddleware),
  this.adminController.getTrainerPTPlans.bind(this.adminController)
);

this.router.patch(
  '/plans/:planId/verify',
  this.adminAuthMiddleware.auth.bind(this.adminAuthMiddleware),
  this.adminValidationMiddleware.validateVerifyPlanInput.bind(this.adminValidationMiddleware),
  this.adminController.verifyPTPlan.bind(this.adminController)
);

this.router.patch(
  '/plans/:planId',
  this.adminAuthMiddleware.auth.bind(this.adminAuthMiddleware),
  this.adminValidationMiddleware.validateAdminPriceInput.bind(this.adminValidationMiddleware),
  this.adminController.updatePTPlanAdminPrice.bind(this.adminController)
);


}

}
