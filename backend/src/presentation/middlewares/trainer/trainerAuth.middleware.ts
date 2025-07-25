import { Request, Response, NextFunction } from 'express';
import { ITrainersRepository } from '@/app/repositories/trainers.repository';
import { ITokenService } from '@/app/providers/token.service';
import { IResponseDTO } from '@/domain/dtos/response.dto';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';

declare module 'express' {
  interface Request {
    trainer?: { id: string | null; email: string };
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
        console.log('[DEBUG] Trainer access token  [traienrauthmiddleware]' ,accessToken ? accessToken[0] : 'No access token');

      if (!accessToken) {
        console.log('[DEBUG] No access token provided traienr authmiddle ware');
        const response: IResponseDTO<null> = {
          success: false,
          status: HttpStatus.UNAUTHORIZED,
          error: {
            code: ERRORMESSAGES.TRAINER_NO_ACCESS_TOKEN_PROVIDED.code,
            message: ERRORMESSAGES.TRAINER_NO_ACCESS_TOKEN_PROVIDED.message,
          },
        };
        res.status(response.status).json(response);
        return;
      }

      const decoded = await this.tokenService.verifyAccessToken(accessToken);
      if (!decoded.id || !decoded.email) {
        console.log('[DEBUG] Invalid access token structure');
        const response: IResponseDTO<null> = {
          success: false,
          status: HttpStatus.UNAUTHORIZED,
          error: {
            code: ERRORMESSAGES.TRAINER_INVALID_ACCESS_TOKEN.code,
            message: ERRORMESSAGES.TRAINER_INVALID_ACCESS_TOKEN.message,
          },
        };
        res.status(response.status).json(response);
        return;
      }

      const trainer = await this.trainersRepository.findById(decoded.id);
      if (!trainer) {
        console.log(`[DEBUG] Trainer not found for id: ${decoded.id}`);
        const response: IResponseDTO<null> = {
          success: false,
          status: HttpStatus.UNAUTHORIZED,
          error: {
            code: ERRORMESSAGES.TRAINER_NOT_FOUND.code,
            message: ERRORMESSAGES.TRAINER_NOT_FOUND.message,
          },
        };
        res.status(response.status).json(response);
        return;
      }

      req.trainer = { id: trainer.id, email: trainer.email.address };
      console.log(`[DEBUG] Trainer authenticated: [trainerAuthmiddleware] ${trainer.email.address}`);
      next();
    } catch (error) {
      console.error('[ERROR] Trainer auth middleware error:', error);
      const response: IResponseDTO<null> = {
        success: false,
        status: HttpStatus.UNAUTHORIZED,
        error: {
          code: ERRORMESSAGES.TRAINER_INVALID_ACCESS_TOKEN.code,
          message: ERRORMESSAGES.TRAINER_INVALID_ACCESS_TOKEN.message,
        },
      };
      res.status(response.status).json(response);
    }
  }
}