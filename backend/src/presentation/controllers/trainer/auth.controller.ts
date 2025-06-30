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


export class TrainerAuthController {
  constructor(
    private createTrainerUseCase: CreateTrainerUseCase,
    private loginTrainerUseCase: LoginTrainerUseCase,
    private logoutTrainerUseCase: LogoutTrainerUseCase,
    private verifyTrainerOtpUseCase: VerifyTrainerOtpUseCase,
    private resendTrainerOtpUseCase: ResendTrainerOtpUseCase,
  ) {}

  async signup(req: Request, res: Response): Promise<void> {
    const data: ICreateTrainerRequestDTO = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] }; // Handle certifications
    data.certifications = files?.['certifications[0][file]']?.map(file => ({
      name: file.originalname,
      issuer: data.certifications[0]?.issuer || '',
      dateEarned: new Date(),
      filePath: file.path,
    }));
    const result = await this.createTrainerUseCase.execute(data);
    if (!result.success) {
      res.status(400).json({ message: result.error });
      return;
    }
    res.status(201).json({ message: 'Trainer created successfully. OTP sent to email.', trainer: result.data?.trainer });
  }

  async login(req: Request, res: Response): Promise<void> {
    const data: ILoginRequestDTO = req.body;
    const result = await this.loginTrainerUseCase.execute(data);
    if (!result.success) {
      res.status(401).json({ message: result.error });
      return;
    }
    res.cookie('trainerAccessToken', result.data?.accessToken, { httpOnly: true, secure: true });
    res.cookie('trainerRefreshToken', result.data?.refreshToken, { httpOnly: true, secure: true });
    res.status(200).json({ trainer: result.data?.trainer });
  }

  async logout(req: Request, res: Response): Promise<void> {
    const data: ILogoutRequestDTO = { email: req.trainer?.email! };
    const result = await this.logoutTrainerUseCase.execute(data);
    if (!result.success) {
      res.status(400).json({ message: result.error });
      return;
    }
    res.clearCookie('trainerAccessToken');
    res.clearCookie('trainerRefreshToken');
    res.status(200).json({ message: 'Logged out successfully' });
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    const data: IVerifyTrainerOtpRequestDTO = req.body;
    const result = await this.verifyTrainerOtpUseCase.execute(data);
    if (!result.success) {
      res.status(400).json({ message: result.error });
      return;
    }
    res.status(200).json({ message: 'OTP verified successfully' });
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

    
}