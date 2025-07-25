// src/app/middlewares/interfaces/IAdminValidationMiddleware.ts
import { Request, Response, NextFunction } from 'express';

export interface IAdminValidationMiddleware {
    validateGetTrainerPTPlans(req: Request, res: Response, next: NextFunction): Promise<void>;
    validateVerifyPlanInput(req: Request, res: Response, next: NextFunction): Promise<void>
    validateAdminPriceInput(req: Request, res: Response, next: NextFunction): Promise<void>
}