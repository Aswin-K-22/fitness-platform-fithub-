import { Request, Response, NextFunction } from 'express';
import { IUsersRepository } from '@/app/repositories/users.repository';
import { ITokenService } from '@/app/providers/token.service';
import { IResponseDTO } from '@/domain/dtos/response.dto';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';

declare module 'express' {
  interface Request {
    user?: { id: string | null; email: string };
  }
}

export class AuthMiddleware {
  constructor(private usersRepository: IUsersRepository, private tokenService: ITokenService) {}

  async auth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = req.cookies?.userAccessToken;
      if (!accessToken) {
        const response: IResponseDTO<null> = {
          success: false,
          status: HttpStatus.UNAUTHORIZED,
          error: {
            code: ERRORMESSAGES.USER_NO_ACCESS_TOKEN.code,
            message: ERRORMESSAGES.USER_NO_ACCESS_TOKEN.message,
          },
        };
        res.status(response.status).json(response);
        return;
      }

      const decoded = await this.tokenService.verifyAccessToken(accessToken);
      if (!decoded.id || !decoded.email) {
        const response: IResponseDTO<null> = {
          success: false,
          status: HttpStatus.UNAUTHORIZED,
          error: {
            code: ERRORMESSAGES.AUTH_INVALID_ACCESS_TOKEN.code,
            message: ERRORMESSAGES.AUTH_INVALID_ACCESS_TOKEN.message,
          },
        };
        res.status(response.status).json(response);
        return;
      }

      const user = await this.usersRepository.findById(decoded.id);
      if (!user) {
        const response: IResponseDTO<null> = {
          success: false,
          status: HttpStatus.UNAUTHORIZED,
          error: {
            code: ERRORMESSAGES.USER_NOT_FOUND.code,
            message: ERRORMESSAGES.USER_NOT_FOUND.message,
          },
        };
        res.status(response.status).json(response);
        return;
      }

      req.user = { id: user.id, email: user.email.address };
      next();
    } catch (error) {
      console.error('User auth middleware error:', error);
      const response: IResponseDTO<null> = {
        success: false,
        status: HttpStatus.UNAUTHORIZED,
        error: {
          code: ERRORMESSAGES.AUTH_INVALID_ACCESS_TOKEN.code,
          message: ERRORMESSAGES.AUTH_INVALID_ACCESS_TOKEN.message,
        },
      };
      res.status(response.status).json(response);
    }
  }
}