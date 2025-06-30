import { IUsersRepository } from '../repositories/users.repository';
import { IForgotPasswordRequestDTO } from '../../domain/dtos/forgotPasswordRequest.dto';
import { UserErrorType } from '../../domain/enums/userErrorType.enum';
import { AuthErrorType } from '../../domain/enums/authErrorType.enum';
import { IEmailService } from '../providers/email.service';

interface ForgotPasswordResponseDTO {
  success: boolean;
  error?: string;
}

export class ForgotPasswordUseCase {
  constructor(
    private userRepository: IUsersRepository,
    private emailService: IEmailService,
  ) {}

  async execute(data: IForgotPasswordRequestDTO): Promise<ForgotPasswordResponseDTO> {
    try {
      const user = await this.userRepository.findByEmail(data.email);
      if (!user) {
        return { success: false, error: UserErrorType.UserNotFound };
      }
      if (!user.isVerified) {
        return { success: false, error: AuthErrorType.NotVerified };
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await this.userRepository.updateOtp(data.email, otp);

      await this.emailService.sendMail({
        from: process.env.EMAIL_USER || 'no-reply@fithub.com',
        to: data.email,
        subject: 'FitHub Password Reset OTP',
        text: `Your OTP to reset your password is ${otp}. It expires in 5 minutes.`,
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: AuthErrorType.EmailSendFailed };
    }
  }
}