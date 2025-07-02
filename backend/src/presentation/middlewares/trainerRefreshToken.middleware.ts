import { Request, Response, NextFunction } from 'express';
import { TrainerErrorType } from '@/domain/enums/trainerErrorType.enum';

export function refreshTokenMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const refreshToken = req.cookies?.trainerRefreshToken;
    if (!refreshToken) {
      console.log('[DEBUG] No refresh token provided');
      res.status(401).json({ success: false, error: TrainerErrorType.NoRefreshTokenProvided });
      return;
    }
    req.body.refreshToken = refreshToken; // Pass to use case
    next();
  } catch (error) {
    console.error('[ERROR] Refresh token middleware error:', error);
    res.status(401).json({ success: false, error: TrainerErrorType.InvalidRequest });
  }
}