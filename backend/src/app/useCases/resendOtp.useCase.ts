import { IUsersRepository } from '../repositories/users.repository';
import { IResendOtpRequestDTO } from '../../domain/dtos/resendOtpRequest.dto';
import { UserErrorType } from '../../domain/enums/userErrorType.enum';
import { AuthErrorType } from '../../domain/enums/authErrorType.enum';
import { IEmailService } from '../providers/email.service';

interface ResendOtpResponseDTO {
  success: boolean;
  error?: string;
}

export class ResendOtpUseCase {
  constructor(
    private userRepository: IUsersRepository,
    private emailService: IEmailService,
  ) {}

  async execute(data: IResendOtpRequestDTO): Promise<ResendOtpResponseDTO> {
    try {
      const user = await this.userRepository.findByEmail(data.email);
      if (!user) {
        return { success: false, error: UserErrorType.UserNotFound };
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await this.userRepository.updateOtp(data.email, otp);

      await this.emailService.sendMail({
        from: process.env.EMAIL_USER || 'no-reply@fithub.com',
        to: data.email,
        subject: 'FitHub OTP Verification',
        text: `Your new OTP is ${otp}. It expires in 30 seconds.`,
      });
      console.log(`Resend new OTP is ${otp}. It expires in 30 seconds.`)
      return { success: true };
    } catch (error) {
      return { success: false, error: AuthErrorType.EmailSendFailed };
    }
  }
}