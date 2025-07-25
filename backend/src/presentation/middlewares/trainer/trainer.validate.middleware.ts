import { Request, Response, NextFunction } from 'express';
import { CreateTrainerRequestDTO, ICreateTrainerRequestDTO } from '../../../domain/dtos/createTrainerRequest.dto';
import { IVerifyTrainerOtpRequestDTO, VerifyTrainerOtpRequestDTO } from '../../../domain/dtos/verifyTrainerOtpRequest.dto';
import { IResendOtpRequestDTO } from '../../../domain/dtos/resendOtpRequest.dto';
import { ILoginRequestDTO, LoginRequestDTO } from '../../../domain/dtos/loginRequest.dto';
import { ILogoutRequestDTO } from '@/domain/dtos/logoutRequest.dto';
import { IRefreshTokenRequestDTO } from '@/domain/dtos/refreshTokenRequest.dto';
import { TrainerErrorType } from '@/domain/enums/trainerErrorType.enum';
import { ptPlanSchema } from '@/domain/dtos/createPTPlanRequest.dto';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { IResponseDTO } from '@/domain/dtos/response.dto';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';

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
          case 'createPTPlan':
          ptPlanSchema.parse(req.body);
          // Validate image separately since it's in req.file
          if (req.file && !['image/jpeg', 'image/png'].includes(req.file.mimetype)) {
            throw new Error(ERRORMESSAGES.GYM_INVALID_IMAGE_FORMAT.message);
          }
          if (req.file && req.file.size > 5 * 1024 * 1024) {
            throw new Error('Image size must not exceed 5MB');
          }
          break;
        default:
          throw new Error('Invalid validation type');
      }
      next();
    } catch (error: any) {
     console.error('[ERROR] Validation error:', error);
      const response: IResponseDTO<null> = {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message || 'Trainer Middlware Validation failed',
        },
      };
      res.status(response.status).json(response);
    }
  };
}