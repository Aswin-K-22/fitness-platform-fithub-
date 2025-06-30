import { ITrainersRepository } from '../repositories/trainers.repository';
import { IResendOtpRequestDTO } from '../../domain/dtos/resendOtpRequest.dto';
import { UserErrorType } from '../../domain/enums/userErrorType.enum';
import { AuthErrorType } from '../../domain/enums/authErrorType.enum';
import { IEmailService } from '../providers/email.service';

interface ResendOtpResponseDTO {
  success: boolean;
  error?: string;
}

export class ResendTrainerOtpUseCase {
  constructor(
    private trainerRepository: ITrainersRepository,
    private emailService: IEmailService,
  ) {}

  async execute(data: IResendOtpRequestDTO): Promise<ResendOtpResponseDTO> {
    try {
      const user = await this.trainerRepository.findByEmail(data.email);
      if (!user) {
        return { success: false, error: UserErrorType.UserNotFound };
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await this.trainerRepository.updateOtp(data.email, otp);

      await this.emailService.sendMail({
        from: process.env.EMAIL_USER || 'no-reply@fithub.com',
        to: data.email,
        subject: 'FitHub OTP Verification',
        text: `Your new OTP is ${otp}. It expires in 30 seconds.`,
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: AuthErrorType.EmailSendFailed };
    }
  }
}