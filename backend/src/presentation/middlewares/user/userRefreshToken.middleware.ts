import { Request, Response, NextFunction } from 'express';
import { IResponseDTO } from '@/domain/dtos/response.dto';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';

export const refreshTokenMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const refreshToken = req.cookies?.userRefreshToken;
    console.log('Refresh token received in middleware:[user side only]', refreshToken ? refreshToken[0] : refreshToken);

    if (!refreshToken) {
      const response: IResponseDTO<null> = {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        error: {
          code: ERRORMESSAGES.AUTH_MISSING_REFRESH_TOKEN.code,
          message: ERRORMESSAGES.AUTH_MISSING_REFRESH_TOKEN.message,
        },
      };
      res.status(response.status).json(response);
      return;
    }

    req.body = { refreshToken };
    next();
  } catch (error) {
    console.error('Refresh token middleware error:', error);
    const response: IResponseDTO<null> = {
      success: false,
      status: HttpStatus.BAD_REQUEST,
      error: {
        code: ERRORMESSAGES.AUTH_INVALID_REFRESH_TOKEN.code,
        message: ERRORMESSAGES.AUTH_INVALID_REFRESH_TOKEN.message,
      },
    };
    res.status(response.status).json(response);
  }
};