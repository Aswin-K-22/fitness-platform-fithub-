import { Request, Response } from 'express';
import { CreateTrainerUseCase } from '@/app/useCases/createTrainer.useCase';
import { LoginTrainerUseCase } from '@/app/useCases/loginTrainer.useCase';
import { LogoutTrainerUseCase } from '@/app/useCases/logoutTrainer.useCase';
import { VerifyTrainerOtpUseCase } from '@/app/useCases/verifyTrainerOtp.useCase';
import { ResendTrainerOtpUseCase } from '@/app/useCases/resendOtpTrainer.useCase';
import { ICreateTrainerRequestDTO } from '@/domain/dtos/createTrainerRequest.dto';
import { ILoginRequestDTO } from '@/domain/dtos/loginRequest.dto';
import { ILogoutRequestDTO } from '@/domain/dtos/logoutRequest.dto';
import { IVerifyTrainerOtpRequestDTO } from '@/domain/dtos/verifyTrainerOtpRequest.dto';
import { IResendOtpRequestDTO } from '@/domain/dtos/resendOtpRequest.dto';
import { TrainerErrorType } from '@/domain/enums/trainerErrorType.enum';
import { IRefreshTokenRequestDTO } from '@/domain/dtos/refreshTokenRequest.dto';
import { TrainerRefreshTokenUseCase } from '@/app/useCases/trainerRefreshToken.useCase';

export class TrainerAuthController {
  constructor(
    private createTrainerUseCase: CreateTrainerUseCase,
    private loginTrainerUseCase: LoginTrainerUseCase,
    private logoutTrainerUseCase: LogoutTrainerUseCase,
    private verifyTrainerOtpUseCase: VerifyTrainerOtpUseCase,
    private resendTrainerOtpUseCase: ResendTrainerOtpUseCase,
    private trainerRefreshTokenUseCase: TrainerRefreshTokenUseCase
  ) {}

  async signup(req: Request, res: Response): Promise<void> {
    try {
      console.log('signup funciton triggered')
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const certificationsData = req.body.certifications
        ? Array.isArray(req.body.certifications)
          ? req.body.certifications
          : JSON.parse(req.body.certifications)
        : [];

      const certifications = certificationsData.map((cert: any, index: number) => {
        const fileField = `certifications[${index}][file]`;
        const file = files[fileField]?.[0];
        if (!file) throw new Error(`Certification ${index + 1}: ${TrainerErrorType.MissingCertificationFile}`);
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
      if (!result.success) {
        res.status(400).json({ message: result.error });
        return;
      }
      res.status(201).json({ message: 'Signup successful. OTP sent to your email.', trainer: result.data?.trainer });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    const data: IVerifyTrainerOtpRequestDTO = req.body;
    const result = await this.verifyTrainerOtpUseCase.execute(data);
    if (!result.success) {
      res.status(400).json({ message: result.error });
      return;
    }
    res.status(200).json({ message: 'OTP verified successfully. Awaiting admin approval.' });
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    const data: IResendOtpRequestDTO = req.body;
    const result = await this.resendTrainerOtpUseCase.execute(data);
    if (!result.success) {
      res.status(400).json({ message: result.error });
      return;
    }
    res.status(200).json({ message: 'OTP resent successfully' });
  }

 async login(req: Request, res: Response): Promise<void> {
    try {
      const data: ILoginRequestDTO = req.body;
      const result = await this.loginTrainerUseCase.execute(data);

      if (!result.success) {
        res.status(401).json({ message: result.error });
        return;
      }

      if (!result.data) {
        res.status(500).json({ message: 'Internal server error' });
        return;
      }

      const { trainer, accessToken, refreshToken } = result.data;

      
    res.cookie('trainerAccessToken', accessToken, { httpOnly: true, secure: true });
    res.cookie('trainerRefreshToken', refreshToken, { httpOnly: true, secure: true });
    
      if (!trainer.verifiedByAdmin) {
        res.status(200).json({ trainer, message: 'Pending admin approval' });
        return;
      }

  res.status(200).json({ trainer });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(401).json({ message: error.message || 'Login failed—check credentials' });
    }
  }

 async logout(req: Request, res: Response): Promise<void> {
    try {
      console.log(`[DEBUG /

] Processing logout for trainer: ${req.trainer?.email}`);
      const data: ILogoutRequestDTO = { email: req.trainer?.email! };
      const result = await this.logoutTrainerUseCase.execute(data);
      if (!result.success) {
        console.log(`[DEBUG] Logout failed: ${result.error}`);
        res.status(400).json({ success: false, message: result.error });
        return;
      }

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
      console.log(`[DEBUG] Cookies cleared for trainer: ${req.trainer?.email}`);
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error: any) {
      console.error(`[ERROR] Logout error for trainer: ${req.trainer?.email}`, error);
      res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }



  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const data: IRefreshTokenRequestDTO = { refreshToken: req.body.refreshToken };
      const result = await this.trainerRefreshTokenUseCase.execute(data);

      if (!result.success || !result.data) {
        console.log(`[DEBUG] Refresh token failed: ${result.error}`);
        res.status(401).json({ success: false, error: result.error });
        return;
      }

      const { trainer, accessToken, refreshToken } = result.data;

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

      console.log(`[DEBUG] New trainer tokens set for: ${trainer.email}`);
      res.status(200).json({ success: true, trainer });
    } catch (error: any) {
      console.error('[ERROR] Trainer refresh token error:', error);
      res.status(401).json({ success: false, error: error.message || 'Invalid refresh token' });
    }
  }
}