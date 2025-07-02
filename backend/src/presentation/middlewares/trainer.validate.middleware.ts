import { Request, Response, NextFunction } from 'express';
import { CreateTrainerRequestDTO, ICreateTrainerRequestDTO } from '../../domain/dtos/createTrainerRequest.dto';
import { IVerifyTrainerOtpRequestDTO, VerifyTrainerOtpRequestDTO } from '../../domain/dtos/verifyTrainerOtpRequest.dto';
import { IResendOtpRequestDTO, ResendOtpRequestDTO } from '../../domain/dtos/resendOtpRequest.dto';
import { ILoginRequestDTO, LoginRequestDTO } from '../../domain/dtos/loginRequest.dto';
import { ILogoutRequestDTO } from '@/domain/dtos/logoutRequest.dto';
import { IRefreshTokenRequestDTO } from '@/domain/dtos/refreshTokenRequest.dto';
import { TrainerErrorType } from '@/domain/enums/trainerErrorType.enum';

export function validateMiddleware(type: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('Middleware received req.body:', req.body);
    try {
      switch (type) {
        case 'signupTrainer':
          new CreateTrainerRequestDTO(req.body);
          break;
        case 'verifyTrainerOtp':
          new VerifyTrainerOtpRequestDTO(req.body);
          break;
        case 'resendTrainerOtp':
          new ResendOtpRequestDTO(req.body);
          break;
        case 'loginTrainer':
          new LoginRequestDTO(req.body);
          break;
        case 'logoutTrainer':
          const data: ILogoutRequestDTO = { email: req.trainer?.email! };
          if (!data.email) {
            throw new Error(TrainerErrorType.NOT_AUTHENTICATED);
          }
          break;
        case 'refreshToken':
          const refreshData: IRefreshTokenRequestDTO = { refreshToken: req.body.refreshToken };
          if (!refreshData.refreshToken) {
            throw new Error(TrainerErrorType.NoRefreshTokenProvided);
          }
          break;
        default:
          throw new Error('Invalid validation type');
      }
      next();
    } catch (error: any) {
      console.error('[ERROR] Validation error:', error);
      res.status(400).json({ success: false, message: error.message || 'Validation failed' });
    }
  };
}