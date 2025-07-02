import { Request, Response } from 'express';
import { LoginAdminUseCase } from '@/app/useCases/loginAdmin.useCase';
import { AdminRefreshTokenUseCase } from '@/app/useCases/adminRefreshToken.useCase';
import { IAdminLoginRequestDTO } from '@/domain/dtos/adminLoginRequest.dto';
import { IAdminRefreshTokenRequestDTO } from '@/domain/dtos/adminRefreshTokenRequest.dto';
import { IAdminLogoutRequestDTO } from '@/domain/dtos/logoutAdminRequest.dto';
import { LogoutAdminUseCase } from '@/app/useCases/logoutAdmin.useCase';

export class AdminAuthController {
  constructor(
    private loginAdminUseCase: LoginAdminUseCase,
    private adminRefreshTokenUseCase: AdminRefreshTokenUseCase,
     private logoutAdminUseCase: LogoutAdminUseCase,
  ) {}

  async login(req: Request, res: Response): Promise<void> {
    const data: IAdminLoginRequestDTO = req.body;
    const result = await this.loginAdminUseCase.execute(data);
    if (!result.success) {
      res.status(401).json({ message: result.error });
      return;
    }
    res.cookie('adminAccessToken', result.data?.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 15 * 60 * 1000, sameSite: 'lax' });
    res.cookie('adminRefreshToken', result.data?.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'lax' });
    res.status(200).json({ user: result.data?.user });
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const data: IAdminRefreshTokenRequestDTO = { refreshToken: req.cookies.adminRefreshToken };
    console.log('admin refresh token trieggerd')
    const result = await this.adminRefreshTokenUseCase.execute(data);
    if (!result.success) {
      res.status(401).json({ message: result.error });
      return;
    }
    res.cookie('adminAccessToken', result.data?.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 15 * 60 * 1000, sameSite: 'lax' });
    res.cookie('adminRefreshToken', result.data?.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'lax' });
    res.status(200).json({ user: result.data?.user });
  }
   async logout(req: Request, res: Response): Promise<void> {
    const data: IAdminLogoutRequestDTO = { email: req.body.email };
    const result = await this.logoutAdminUseCase.execute(data);
    if (!result.success) {
      res.status(400).json({ message: result.error });
      return;
    }
    res.clearCookie('adminAccessToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    res.clearCookie('adminRefreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    res.status(200).json({ message: 'Logged out successfully' });
  }
}