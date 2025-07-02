import { ITrainersRepository } from '../repositories/trainers.repository';
import { IEmailService } from '../providers/email.service';
import { IResendOtpRequestDTO, ResendOtpRequestDTO } from '../../domain/dtos/resendOtpRequest.dto';
import { TrainerErrorType } from '../../domain/enums/trainerErrorType.enum';
import { generateOtp } from '../../infra/utils/otp';

interface ResendTrainerOtpResult {
  success: boolean;
  error?: string;
}

export class ResendTrainerOtpUseCase {
  constructor(
    private trainersRepository: ITrainersRepository,
    private emailService: IEmailService
  ) {}

  async execute(data: IResendOtpRequestDTO): Promise<ResendTrainerOtpResult> {
    try {
      const dto = new ResendOtpRequestDTO(data);

      const trainer = await this.trainersRepository.findByEmail(dto.email);
      if (!trainer) {
        return { success: false, error: TrainerErrorType.TrainerNotFound };
      }

      if (trainer.isVerified) {
        return { success: false, error: TrainerErrorType.AlreadyVerified };
      }

      const otp = generateOtp();
      await this.trainersRepository.updateOtp(dto.email, otp);

      await this.emailService.sendMail({
        from: process.env.EMAIL_USER || 'no-reply@fithub.com',
        to: dto.email,
        subject: 'FitHub Trainer Signup - OTP Verification',
        text: `Your new OTP is ${otp}. It expires in 30 seconds.`,
      });
      console.log( `Trainer Resend  new OTP is ${otp}. It expires in 30 seconds.`)
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Internal server error' };
    }
  }
}