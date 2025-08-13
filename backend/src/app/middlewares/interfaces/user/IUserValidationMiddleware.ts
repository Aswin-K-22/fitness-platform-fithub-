// src/app/middlewares/interfaces/user/IUserValidationMiddleware.ts
import { Request, Response, NextFunction } from 'express';

export interface IUserValidationMiddleware {
  validateSignup(req: Request, res: Response, next: NextFunction): Promise<void>;
  validateLogin(req: Request, res: Response, next: NextFunction): Promise<void>;
  validateGoogleAuth(req: Request, res: Response, next: NextFunction): Promise<void>;
  validateResendOtp(req: Request, res: Response, next: NextFunction): Promise<void>;
  validateForgotPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
  validateVerifyOtp(req: Request, res: Response, next: NextFunction): Promise<void>;
  validateResetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
  validateLogout(req: Request, res: Response, next: NextFunction): Promise<void>;
  validateRefreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
  validateUpdateUserProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
  validateInitiateMembershipPayment(req: Request, res: Response, next: NextFunction): Promise<void>;
  validateVerifyMembershipPayment(req: Request, res: Response, next: NextFunction): Promise<void>;
  validateMarkNotificationRead(req: Request, res: Response, next: NextFunction): Promise<void>;
  validateGetPTPlans(req: Request, res: Response, next: NextFunction): Promise<void>;
}