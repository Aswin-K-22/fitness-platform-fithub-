import { Request, Response, NextFunction } from 'express';

export interface ITrainerAuthMiddleware {
  auth(req: Request, res: Response, next: NextFunction): Promise<void>;
}