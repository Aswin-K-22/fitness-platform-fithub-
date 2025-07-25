//src/presentation/middlewares/trainerRefreshToken.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { IResponseDTO } from '@/domain/dtos/response.dto';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';

export function refreshTokenMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const refreshToken = req.cookies?.trainerRefreshToken;
      console.log('[DEBUG] Trainer refresh token = ' ,refreshToken ? refreshToken[0] :  'not provided');

    if (!refreshToken) {
      console.log('[DEBUG] No refresh token provided');
      const response: IResponseDTO<null> = {
        success: false,
        status: HttpStatus.UNAUTHORIZED,
        error: {
          code: ERRORMESSAGES.TRAINER_NO_REFRESH_TOKEN_PROVIDED.code,
          message: ERRORMESSAGES.TRAINER_NO_REFRESH_TOKEN_PROVIDED.message,
        },
      };
      res.status(response.status).json(response);
      return;
    }

  req.body = { refreshToken };
    next();
  } catch (error) {
    console.error('[ERROR] Refresh token middleware error:', error);
    const response: IResponseDTO<null> = {
      success: false,
      status: HttpStatus.BAD_REQUEST,
      error: {
        code: ERRORMESSAGES.TRAINER_INVALID_REQUEST.code,
        message: ERRORMESSAGES.TRAINER_INVALID_REQUEST.message,
      },
    };
    res.status(response.status).json(response);
  }
}