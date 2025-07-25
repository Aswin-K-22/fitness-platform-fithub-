// src/app/middlewares/interfaces/ITrainerValidationMiddleware.ts
import { Request, Response, NextFunction } from 'express';

export interface ITrainerValidationMiddleware {
  validateSignupTrainer(req: Request, res: Response, next: NextFunction): Promise<void>;
  validateCreatePTPlan(req: Request, res: Response, next: NextFunction): Promise<void>;
  validateGetPTPlans(req: Request, res: Response, next: NextFunction): Promise<void>;
  validateEditPTPlan(req: Request, res: Response, next: NextFunction): Promise<void>;
  validateStopPTPlan(req: Request, res: Response, next: NextFunction): Promise<void>;
  validateResumePTPlan(req: Request, res: Response, next: NextFunction): Promise<void>;
  validateUpdateTrainerProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
}