import { Request, Response, NextFunction } from 'express';
import { ITrainersRepository } from '@/app/repositories/trainers.repository';
import { ITokenService } from '@/app/providers/token.service';
import { TrainerErrorType } from '@/domain/enums/trainerErrorType.enum';

declare module 'express' {
  interface Request {
    trainer?: { id: string; email: string };
  }
}

export class TrainerAuthMiddleware {
  constructor(
    private trainersRepository: ITrainersRepository,
    private tokenService: ITokenService
  ) {}

  async auth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = req.cookies?.trainerAccessToken;
      if (!accessToken) {
        console.log('[DEBUG] No access token provided');
        res.status(401).json({ success: false, error: TrainerErrorType.NoAccessTokenProvided });
        return;
      }

      const decoded = await this.tokenService.verifyAccessToken(accessToken);
      if (!decoded.id) {
        console.log('[DEBUG] Invalid access token structure');
        res.status(401).json({ success: false, error: TrainerErrorType.InvalidAccessToken });
        return;
      }

      const trainer = await this.trainersRepository.findById(decoded.id);
      if (!trainer) {
        console.log(`[DEBUG] Trainer not found for id: ${decoded.id}`);
        res.status(401).json({ success: false, error: TrainerErrorType.TrainerNotFound });
        return;
      }

      req.trainer = { id: trainer.id!, email: trainer.email.address };
      console.log(`[DEBUG] Trainer authenticated: ${trainer.email.address}`);
      next();
    } catch (error) {
      console.error('[ERROR] Trainer auth middleware error:', error);
      res.status(401).json({ success: false, error: TrainerErrorType.InvalidAccessToken });
    }
  }
}