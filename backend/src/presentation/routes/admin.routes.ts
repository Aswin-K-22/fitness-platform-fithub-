import { Router } from 'express';
import { AdminAuthController } from '@/presentation/controllers/admin/adminAuth.controller';
import { AdminController } from '@/presentation/controllers/admin/admin.controller';
import { AdminAuthMiddleware } from '@/presentation/middlewares/adminAuth.middleware';
import { validateMiddleware } from '@/presentation/middlewares/admin.validate.middleware';
import { adminRefreshTokenMiddleware } from '@/presentation/middlewares/adminRefreshToken.middleware';
import { UsersRepository } from '@/infra/repositories/users.repository';
import { JwtTokenService } from '@/infra/providers/jwtTokenService';
import { upload } from '@/infra/config/multer';

export class AdminRoutes {
  public router: Router;

  constructor(
    private adminAuthController: AdminAuthController,
    private adminController: AdminController,
    private adminAuthMiddleware: AdminAuthMiddleware,
    private usersRepository: UsersRepository,
    private tokenService: JwtTokenService,
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
}



}
