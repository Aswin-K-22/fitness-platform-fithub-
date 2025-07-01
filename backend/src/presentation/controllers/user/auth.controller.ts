import { Request, Response } from 'express';
import { CreateUserUseCase } from '@/app/useCases/createUser.useCase';
import { LoginUserUseCase } from '@/app/useCases/loginUser.useCase';
import { LogoutUserUseCase } from '@/app/useCases/logoutUser.useCase';
import { GoogleAuthUseCase } from '@/app/useCases/googleAuth.useCase';
import { RefreshTokenUseCase } from '@/app/useCases/refreshToken.useCase';
import { ResendOtpUseCase } from '@/app/useCases/resendOtp.useCase';
import { ForgotPasswordUseCase } from '@/app/useCases/forgotPassword.useCase';
import { VerifyForgotPasswordOtpUseCase } from '@/app/useCases/verifyForgotPasswordOtp.useCase';
import { ResetPasswordUseCase } from '@/app/useCases/resetPassword.useCase';
import { VerifyUserOtpUseCase} from '@/app/useCases/verifyUserOtp.useCase'

import { ICreateUserRequestDTO } from '@/domain/dtos/createUserRequest.dto';
import { ILoginRequestDTO } from '@/domain/dtos/loginRequest.dto';
import { ILogoutRequestDTO } from '@/domain/dtos/logoutRequest.dto';
import { IGoogleAuthRequestDTO } from '@/domain/dtos/googleAuthRequest.dto';
import { IRefreshTokenRequestDTO } from '@/domain/dtos/refreshTokenRequest.dto';
import { IResendOtpRequestDTO } from '@/domain/dtos/resendOtpRequest.dto';
import { IForgotPasswordRequestDTO } from '@/domain/dtos/forgotPasswordRequest.dto';
import { IVerifyOtpRequestDTO } from '@/domain/dtos/verifyOtpRequest.dto';
import { IResetPasswordRequestDTO } from '@/domain/dtos/resetPasswordRequest.dto';


export class UserAuthController {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private loginUserUseCase: LoginUserUseCase,
    private logoutUserUseCase: LogoutUserUseCase,
    private googleAuthUseCase: GoogleAuthUseCase,
    private refreshTokenUseCase: RefreshTokenUseCase,
    private resendOtpUseCase: ResendOtpUseCase,
    private forgotPasswordUseCase: ForgotPasswordUseCase,
    private verifyForgotPasswordOtpUseCase: VerifyForgotPasswordOtpUseCase,
    private resetPasswordUseCase: ResetPasswordUseCase,
    private  verifyUserOtpUseCase :  VerifyUserOtpUseCase
  ) {}

  async signup(req: Request, res: Response): Promise<void> {
    const data: ICreateUserRequestDTO = req.body;
    const result = await this.createUserUseCase.execute(data);
    if (!result.success) {
      res.status(400).json({ message: result.error });
      return;
    }
    res.status(201).json({ message: 'User created successfully. OTP sent to email.', user: result.data?.user });
  }

  async login(req: Request, res: Response): Promise<void> {
    const data: ILoginRequestDTO = req.body;
    console.log('login fn called with data=',data)

    const result = await this.loginUserUseCase.execute(data);
    if (!result.success) {
      res.status(401).json({ message: result.error });
      return;
    }
    res.cookie('userAccessToken', result.data?.accessToken, { httpOnly: true, secure: true });
    res.cookie('userRefreshToken', result.data?.refreshToken, { httpOnly: true, secure: true });
    res.status(200).json({ user: result.data?.user });
  }

  async logout(req: Request, res: Response): Promise<void> {
    const data: ILogoutRequestDTO = { email: req.user?.email! };
    const result = await this.logoutUserUseCase.execute(data);
    if (!result.success) {
      res.status(400).json({ message: result.error });
      return;
    }
    res.clearCookie('userAccessToken');
    res.clearCookie('userRefreshToken');
    res.status(200).json({ message: 'Logged out successfully' });
  }

  async googleAuth(req: Request, res: Response): Promise<void> {
    const data: IGoogleAuthRequestDTO = req.body;
    const result = await this.googleAuthUseCase.execute(data);
    if (!result.success) {
      res.status(401).json({ message: result.error });
      return;
    }
    res.cookie('userAccessToken', result.data?.accessToken, { httpOnly: true, secure: true });
    res.cookie('userRefreshToken', result.data?.refreshToken, { httpOnly: true, secure: true });
    res.status(200).json({ user: result.data?.user });
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    console.log('Refresh token route hit, body:', req.body.refreshToken[0], 'cookie:', req.cookies.userRefreshToken[0]);
    const data: IRefreshTokenRequestDTO = { refreshToken: req.cookies.userRefreshToken };
    const result = await this.refreshTokenUseCase.execute(data);
    if (!result.success) {
      res.status(401).json({ message: result.error });
      return;
    }
    res.cookie('userAccessToken', result.data?.accessToken, { httpOnly: true, secure: true });
    res.cookie('userRefreshToken', result.data?.refreshToken, { httpOnly: true, secure: true });
    res.status(200).json({ user: result.data?.user });
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    const data: IResendOtpRequestDTO = req.body;
    const result = await this.resendOtpUseCase.execute(data);
    if (!result.success) {
      res.status(400).json({ message: result.error });
      return;
    }
    res.status(200).json({ message: 'OTP resent successfully' });
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const data: IForgotPasswordRequestDTO = req.body;
    const result = await this.forgotPasswordUseCase.execute(data);
    if (!result.success) {
      res.status(400).json({ message: result.error });
      return;
    }
    res.status(200).json({ message: 'Password reset OTP sent to email' });
  }

  async verifyForgotPasswordOtp(req: Request, res: Response): Promise<void> {
    const data: IVerifyOtpRequestDTO = req.body;
    const result = await this.verifyForgotPasswordOtpUseCase.execute(data);
    if (!result.success) {
      res.status(400).json({ message: result.error });
      return;
    }
    res.status(200).json({ message: 'OTP verified successfully' });
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const data: IResetPasswordRequestDTO = req.body;
    const result = await this.resetPasswordUseCase.execute(data);
    if (!result.success) {
      res.status(400).json({ message: result.error });
      return;
    }
    res.status(200).json({ message: 'Password reset successfully' });
  }
  async verifyOtp(req: Request, res: Response): Promise<void> {
  const data: IVerifyOtpRequestDTO = req.body;
  const result = await this.verifyUserOtpUseCase.execute(data);
  if (!result.success) {
    res.status(400).json({ message: result.error });
    return;
  }
  res.cookie('userAccessToken', result.data?.accessToken, { httpOnly: true, secure: true });
  res.cookie('userRefreshToken', result.data?.refreshToken, { httpOnly: true, secure: true });
  res.status(200).json({ message: 'OTP verified successfully', user: result.data?.user });
}
}