// src/presentation/controllers/user/auth.controller.ts
import { Request, Response } from 'express';
import { ICreateUserUseCase } from '@/app/useCases/interfaces/ICreateUserUseCase';
import { ILoginUserUseCase } from '@/app/useCases/interfaces/ILoginUserUseCase';
import { ILogoutUserUseCase } from '@/app/useCases/interfaces/ILogoutUserUseCase';
import { IGoogleAuthUseCase } from '@/app/useCases/interfaces/IGoogleAuthUseCase';
import { IRefreshTokenUseCase } from '@/app/useCases/interfaces/IRefreshTokenUseCase';
import { IResendOtpUseCase } from '@/app/useCases/interfaces/IResendOtpUseCase';
import { IForgotPasswordUseCase } from '@/app/useCases/interfaces/IForgotPasswordUseCase';
import { IVerifyForgotPasswordOtpUseCase } from '@/app/useCases/interfaces/IVerifyForgotPasswordOtpUseCase';
import { IResetPasswordUseCase } from '@/app/useCases/interfaces/IResetPasswordUseCase';
import { IVerifyUserOtpUseCase } from '@/app/useCases/interfaces/IVerifyUserOtpUseCase';
import { ICreateUserRequestDTO } from '@/domain/dtos/createUserRequest.dto';
import { ILoginRequestDTO } from '@/domain/dtos/loginRequest.dto';
import { ILogoutRequestDTO } from '@/domain/dtos/logoutRequest.dto';
import { IGoogleAuthRequestDTO } from '@/domain/dtos/googleAuthRequest.dto';
import { IRefreshTokenRequestDTO } from '@/domain/dtos/refreshTokenRequest.dto';
import { IResendOtpRequestDTO } from '@/domain/dtos/resendOtpRequest.dto';
import { IForgotPasswordRequestDTO } from '@/domain/dtos/forgotPasswordRequest.dto';
import { IVerifyOtpRequestDTO } from '@/domain/dtos/verifyOtpRequest.dto';
import { IResetPasswordRequestDTO } from '@/domain/dtos/resetPasswordRequest.dto';
import { IResponseDTO } from '@/domain/dtos/response.dto';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { MESSAGES } from '@/domain/constants/messages.constant';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';

export class UserAuthController {
  constructor(
    private createUserUseCase: ICreateUserUseCase,
    private loginUserUseCase: ILoginUserUseCase,
    private logoutUserUseCase: ILogoutUserUseCase,
    private googleAuthUseCase: IGoogleAuthUseCase,
    private refreshTokenUseCase: IRefreshTokenUseCase,
    private resendOtpUseCase: IResendOtpUseCase,
    private forgotPasswordUseCase: IForgotPasswordUseCase,
    private verifyForgotPasswordOtpUseCase: IVerifyForgotPasswordOtpUseCase,
    private resetPasswordUseCase: IResetPasswordUseCase,
    private verifyUserOtpUseCase: IVerifyUserOtpUseCase
  ) {}

  private sendResponse<T>(res: Response, result: IResponseDTO<T>): void {
    res.status(result.status).json({
      success: result.success,
      message: result.message,
      ...(result.success ? { data: result.data } : { error: result.error }),
    });
  }

  async signup(req: Request, res: Response): Promise<void> {
    const data: ICreateUserRequestDTO = req.body;
    const result = await this.createUserUseCase.execute(data);
    this.sendResponse(res, {
      ...result,
      message: result.success ? MESSAGES.OTP_SENT : result.message,
      status: result.success ? HttpStatus.CREATED : result.status,
    });
  }

  async login(req: Request, res: Response): Promise<void> {
    const data: ILoginRequestDTO = req.body;
    const result = await this.loginUserUseCase.execute(data);
    if (result.success && result.data) {
      res.cookie('userAccessToken', result.data.accessToken, { httpOnly: true, secure: true });
      res.cookie('userRefreshToken', result.data.refreshToken, { httpOnly: true, secure: true });
    }
    this.sendResponse(res, {
      ...result,
      message: result.success ? MESSAGES.USER_LOGGED_IN : result.message,
    });
  }

  async logout(req: Request, res: Response): Promise<void> {
    const email = req.user?.email;
    if (!email) {
      return this.sendResponse(res, {
        success: false,
        status: HttpStatus.UNAUTHORIZED,
        error: {
          code: ERRORMESSAGES.AUTH_USER_NOT_AUTHENTICATED.code,
          message: ERRORMESSAGES.AUTH_USER_NOT_AUTHENTICATED.message,
        },
      });
    }
    const data: ILogoutRequestDTO = { email };
    const result = await this.logoutUserUseCase.execute(data);
    if (result.success) {
      res.clearCookie('userAccessToken');
      res.clearCookie('userRefreshToken');
    }
    this.sendResponse(res, {
      ...result,
      message: result.success ? MESSAGES.USER_LOGGED_OUT : result.message,
    });
  }

  async googleAuth(req: Request, res: Response): Promise<void> {
    const data: IGoogleAuthRequestDTO = req.body;
    const result = await this.googleAuthUseCase.execute(data);
    if (result.success && result.data) {
      res.cookie('userAccessToken', result.data.accessToken, { httpOnly: true, secure: true });
      res.cookie('userRefreshToken', result.data.refreshToken, { httpOnly: true, secure: true });
    }
    this.sendResponse(res, {
      ...result,
      message: result.success ? MESSAGES.USER_LOGGED_IN : result.message,
    });
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies.userRefreshToken;
    if (!refreshToken) {
      return this.sendResponse(res, {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        error: {
          code: ERRORMESSAGES.AUTH_MISSING_REFRESH_TOKEN.code,
          message: ERRORMESSAGES.AUTH_MISSING_REFRESH_TOKEN.message,
        },
      });
    }
    const data: IRefreshTokenRequestDTO = { refreshToken };
    const result = await this.refreshTokenUseCase.execute(data);
    if (result.success && result.data) {
      res.cookie('userAccessToken', result.data.accessToken, { httpOnly: true, secure: true });
      res.cookie('userRefreshToken', result.data.refreshToken, { httpOnly: true, secure: true });
    }
    this.sendResponse(res, result);
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    const data: IResendOtpRequestDTO = req.body;
    const result = await this.resendOtpUseCase.execute(data);
    this.sendResponse(res, {
      ...result,
      message: result.success ? MESSAGES.OTP_SENT : result.message,
    });
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const data: IForgotPasswordRequestDTO = req.body;
    const result = await this.forgotPasswordUseCase.execute(data);
    this.sendResponse(res, {
      ...result,
      message: result.success ? MESSAGES.OTP_SENT : result.message,
    });
  }

  async verifyForgotPasswordOtp(req: Request, res: Response): Promise<void> {
    const data: IVerifyOtpRequestDTO = req.body;
    const result = await this.verifyForgotPasswordOtpUseCase.execute(data);
    this.sendResponse(res, {
      ...result,
      message: result.success ? MESSAGES.OTP_VERIFIED : result.message,
    });
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const data: IResetPasswordRequestDTO = req.body;
    const result = await this.resetPasswordUseCase.execute(data);
    this.sendResponse(res, {
      ...result,
      message: result.success ? MESSAGES.UPDATED : result.message,
    });
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    const data: IVerifyOtpRequestDTO = req.body;
    const result = await this.verifyUserOtpUseCase.execute(data);
    if (result.success && result.data) {
      res.cookie('userAccessToken', result.data.accessToken, { httpOnly: true, secure: true });
      res.cookie('userRefreshToken', result.data.refreshToken, { httpOnly: true, secure: true });
    }
    this.sendResponse(res, {
      ...result,
      message: result.success ? MESSAGES.OTP_VERIFIED : result.message,
    });
  }
}