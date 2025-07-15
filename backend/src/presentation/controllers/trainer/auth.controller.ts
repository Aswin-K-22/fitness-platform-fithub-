import { Request, Response } from 'express';
import { ICreateTrainerUseCase } from '@/app/useCases/interfaces/ICreateTrainerUseCase';
import { ILoginTrainerUseCase } from '@/app/useCases/interfaces/ILoginTrainerUseCase';
import { ILogoutTrainerUseCase } from '@/app/useCases/interfaces/ILogoutTrainerUseCase';
import { IVerifyTrainerOtpUseCase } from '@/app/useCases/interfaces/IVerifyTrainerOtpUseCase';
import { IResendTrainerOtpUseCase } from '@/app/useCases/interfaces/IResendTrainerOtpUseCase';
import { ITrainerRefreshTokenUseCase } from '@/app/useCases/interfaces/ITrainerRefreshTokenUseCase';
import { ICreateTrainerRequestDTO } from '@/domain/dtos/createTrainerRequest.dto';
import { ILoginRequestDTO } from '@/domain/dtos/loginRequest.dto';
import { ILogoutRequestDTO } from '@/domain/dtos/logoutRequest.dto';
import { IVerifyTrainerOtpRequestDTO } from '@/domain/dtos/verifyTrainerOtpRequest.dto';
import { IResendOtpRequestDTO } from '@/domain/dtos/resendOtpRequest.dto';
import { IRefreshTokenRequestDTO } from '@/domain/dtos/refreshTokenRequest.dto';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { IResponseDTO } from '@/domain/dtos/response.dto';

export class TrainerAuthController {
  constructor(
    private readonly createTrainerUseCase: ICreateTrainerUseCase,
    private readonly loginTrainerUseCase: ILoginTrainerUseCase,
    private readonly logoutTrainerUseCase: ILogoutTrainerUseCase,
    private readonly verifyTrainerOtpUseCase: IVerifyTrainerOtpUseCase,
    private readonly resendTrainerOtpUseCase: IResendTrainerOtpUseCase,
    private readonly trainerRefreshTokenUseCase: ITrainerRefreshTokenUseCase
  ) {}

  private sendResponse<T>(res: Response, result: IResponseDTO<T>): void {
    res.status(result.status).json({
      success: result.success,
      message: result.message,
      ...(result.success ? { data: result.data } : { error: result.error }),
    });
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    res.cookie('trainerAccessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000, // 15 minutes
      sameSite: 'lax',
    });
    res.cookie('trainerRefreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax',
    });
  }

  private clearAuthCookies(res: Response): void {
    res.clearCookie('trainerAccessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.clearCookie('trainerRefreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  async signup(req: Request, res: Response): Promise<void> {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const certificationsData = req.body.certifications
        ? Array.isArray(req.body.certifications)
          ? req.body.certifications
          : JSON.parse(req.body.certifications)
        : [];

      const certifications = certificationsData.map((cert: any, index: number) => {
        const fileField = `certifications[${index}][file]`;
        const file = files[fileField]?.[0];
        if (!file) {
          throw new Error(`${ERRORMESSAGES.TRAINER_MISSING_CERTIFICATION_FILE.code}: ${ERRORMESSAGES.TRAINER_MISSING_CERTIFICATION_FILE.message}`);
        }
        return {
          name: cert.name?.trim() || '',
          issuer: cert.issuer?.trim() || '',
          dateEarned: cert.dateEarned ? new Date(cert.dateEarned) : new Date(),
          filePath: `/uploads/${file.filename}`,
        };
      });

      const data: ICreateTrainerRequestDTO = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        experienceLevel: req.body.experienceLevel,
        specialties: req.body.specialties ? JSON.parse(req.body.specialties) : [],
        bio: req.body.bio,
        certifications,
      };

      const result = await this.createTrainerUseCase.execute(data);
      this.sendResponse(res, result);
    } catch (error: any) {
      console.error('[ERROR] Signup error:', error);
      this.sendResponse(res, {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: error.message.includes(':')
            ? error.message.split(':')[0]
            : ERRORMESSAGES.GENERIC_ERROR.code,
          message: error.message.includes(':')
            ? error.message.split(':')[1].trim()
            : ERRORMESSAGES.GENERIC_ERROR.message,
        },
      });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const data: IVerifyTrainerOtpRequestDTO = req.body;
      const result = await this.verifyTrainerOtpUseCase.execute(data);
      this.sendResponse(res, result);
    } catch (error: any) {
      console.error('[ERROR] Verify OTP error:', error);
      this.sendResponse(res, {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: ERRORMESSAGES.GENERIC_ERROR.code,
          message: ERRORMESSAGES.GENERIC_ERROR.message,
        },
      });
    }
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const data: IResendOtpRequestDTO = req.body;
      const result = await this.resendTrainerOtpUseCase.execute(data);
      this.sendResponse(res, result);
    } catch (error: any) {
      console.error('[ERROR] Resend OTP error:', error);
      this.sendResponse(res, {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: ERRORMESSAGES.GENERIC_ERROR.code,
          message: ERRORMESSAGES.GENERIC_ERROR.message,
        },
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const data: ILoginRequestDTO = req.body;
      const result = await this.loginTrainerUseCase.execute(data);

      if (result.success && result.data) {
        const { accessToken, refreshToken } = result.data;
       this.setAuthCookies(res, accessToken, refreshToken)
      }

      this.sendResponse(res, result);
    } catch (error: any) {
      console.error('[ERROR] Login error:', error);
      this.sendResponse(res, {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: ERRORMESSAGES.GENERIC_ERROR.code,
          message: ERRORMESSAGES.GENERIC_ERROR.message,
        },
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    if (!req.trainer?.email) {
      this.sendResponse(res, {
        success: false,
        status: HttpStatus.UNAUTHORIZED,
        error: {
          code: ERRORMESSAGES.TRAINER_NOT_AUTHENTICATED.code,
          message: ERRORMESSAGES.TRAINER_NOT_AUTHENTICATED.message,
        },
      });
      return;
    }

    try {
      const data: ILogoutRequestDTO = { email: req.trainer.email };
      const result = await this.logoutTrainerUseCase.execute(data);
      this.clearAuthCookies(res);
      this.sendResponse(res, result);
    } catch (error: any) {
      console.error('[ERROR] Logout error:', error);
      this.sendResponse(res, {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: ERRORMESSAGES.GENERIC_ERROR.code,
          message: ERRORMESSAGES.GENERIC_ERROR.message,
        },
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const data: IRefreshTokenRequestDTO = { refreshToken: req.body.refreshToken };
      const result = await this.trainerRefreshTokenUseCase.execute(data);

      if (result.success && result.data) {
        const { accessToken, refreshToken } = result.data;
        this.setAuthCookies(res, accessToken, refreshToken);
      }

      this.sendResponse(res, result);
    } catch (error: any) {
      console.error('[ERROR] Trainer refresh token error:', error);
      this.sendResponse(res, {
        success: false,
        status: HttpStatus.UNAUTHORIZED,
        error: {
          code: ERRORMESSAGES.TRAINER_INVALID_REFRESH_TOKEN.code,
          message: ERRORMESSAGES.TRAINER_INVALID_REFRESH_TOKEN.message,
        },
      });
    }
  }
}