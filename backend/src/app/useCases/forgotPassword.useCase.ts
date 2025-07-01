import { IUsersRepository } from '../repositories/users.repository';
import { IEmailService } from '../providers/email.service';
import { IForgotPasswordRequestDTO } from '../../domain/dtos/forgotPasswordRequest.dto';
import { UserErrorType } from '../../domain/enums/userErrorType.enum';
import { Email } from '../../domain/valueObjects/email.valueObject';

interface ForgotPasswordResponseDTO {
  success: boolean;
  error?: string;
}

export class ForgotPasswordUseCase {
  constructor(
    private userRepository: IUsersRepository,
    private emailService: IEmailService,
  ) {}

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async execute(data: IForgotPasswordRequestDTO): Promise<ForgotPasswordResponseDTO> {
    try {
      const email = new Email({ address: data.email });
      const user = await this.userRepository.findByEmail(email.address);

      if (!user) {
        return { success: false, error: UserErrorType.UserNotFound };
      }
      console.log('user verification =' ,user.isVerified)
      if (!user.isVerified) {
        return { success: false, error: UserErrorType.UserNotVerified };
      }

      const otp = this.generateOtp();
      await this.userRepository.updateOtp(email.address, otp);

      await this.emailService.sendMail({
        from: process.env.EMAIL_USER || 'no-reply@fithub.com',
        to: email.address,
        subject: 'FitHub Password Reset OTP',
        text: `Your OTP to reset your password is ${otp}. It expires in 30 seconds.`,
      });
      console.log(`User OTP to reset your password is ${otp}. It expires in 30 seconds.`)
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}