// src/presentation/controllers/admin/adminAuth.controller.ts

import { Request, Response } from 'express';
import { ILoginAdminUseCase } from '@/app/useCases/interfaces/ILoginAdminUseCase';
import { IAdminRefreshTokenUseCase } from '@/app/useCases/interfaces/IAdminRefreshTokenUseCase';
import { ILogoutAdminUseCase } from '@/app/useCases/interfaces/ILogoutAdminUseCase';
import { IAdminLoginRequestDTO } from '@/domain/dtos/adminLoginRequest.dto';
import { IAdminRefreshTokenRequestDTO } from '@/domain/dtos/adminRefreshTokenRequest.dto';
import { IAdminLogoutRequestDTO } from '@/domain/dtos/logoutAdminRequest.dto';
import { IResponseDTO } from '@/domain/dtos/response.dto';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { IAdminAuthController } from '@/app/controllers/interfaces/admin/IAdminAuthController';

export class AdminAuthController implements IAdminAuthController {
  constructor(
    private readonly loginAdminUseCase: ILoginAdminUseCase,
    private readonly adminRefreshTokenUseCase: IAdminRefreshTokenUseCase,
    private readonly logoutAdminUseCase: ILogoutAdminUseCase
  ) {}

  private sendResponse<T>(res: Response, result: IResponseDTO<T>): void {
    res.status(result.status).json({
      success: result.success,
      message: result.message,
      ...(result.success ? { data: result.data } : { error: result.error }),
    });
  }

  async login(req: Request, res: Response): Promise<void> {
    const data: IAdminLoginRequestDTO = req.body;
    const result = await this.loginAdminUseCase.execute(data);

    if (result.success && result.data) {
      res.cookie('adminAccessToken', result.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60 * 1000, // 15 minutes
        sameSite: 'lax',
      });
      res.cookie('adminRefreshToken', result.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax',
      });
    }

    this.sendResponse(res, result);
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies.adminRefreshToken;
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

    const data: IAdminRefreshTokenRequestDTO = { refreshToken };
    const result = await this.adminRefreshTokenUseCase.execute(data);

    if (result.success && result.data) {
      res.cookie('adminAccessToken', result.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60 * 1000, // 15 minutes
        sameSite: 'lax',
      });
      res.cookie('adminRefreshToken', result.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax',
      });
    }

    this.sendResponse(res, result);
  }

  async logout(req: Request, res: Response): Promise<void> {
    const email = req.body.email;
    if (!email) {
      return this.sendResponse(res, {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        error: {
          code: ERRORMESSAGES.AUTH_MISSING_EMAIL.code,
          message: ERRORMESSAGES.AUTH_MISSING_EMAIL.message,
        },
      });
    }

    const data: IAdminLogoutRequestDTO = { email };
    const result = await this.logoutAdminUseCase.execute(data);

    if (result.success) {
      res.clearCookie('adminAccessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      res.clearCookie('adminRefreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    }

    this.sendResponse(res, result);
  }
}