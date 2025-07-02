import { Router } from 'express';
import { AdminAuthController } from '@/presentation/controllers/admin/adminAuth.controller';
import { AdminController } from '@/presentation/controllers/admin/admin.controller';
import { AdminAuthMiddleware } from '@/presentation/middlewares/adminAuth.middleware';
import { validateMiddleware } from '@/presentation/middlewares/admin.validate.middleware';
import { adminRefreshTokenMiddleware } from '@/presentation/middlewares/adminRefreshToken.middleware';
import { UsersRepository } from '@/infra/repositories/users.repository';
import { JwtTokenService } from '@/infra/providers/jwtTokenService';

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
    this.router.post('/auth/refresh-token', (req, res, next) => adminRefreshTokenMiddleware(req, res, next, this.usersRepository, this.tokenService), validateMiddleware('adminRefreshToken'), this.adminAuthController.refreshToken.bind(this.adminAuthController));
    this.router.get('/auth/get', this.adminAuthMiddleware.auth.bind(this.adminAuthMiddleware), this.adminController.getAdmin.bind(this.adminController));
  }
}
