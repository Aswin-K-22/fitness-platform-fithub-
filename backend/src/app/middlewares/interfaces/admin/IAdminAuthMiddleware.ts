import { Request, Response, NextFunction } from 'express';

export interface IAdminAuthMiddleware {
  auth(req: Request, res: Response, next: NextFunction): Promise<void>;
}