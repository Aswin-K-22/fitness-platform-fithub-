import { IUsersRepository } from '../repositories/users.repository';
import { IVerifyOtpRequestDTO } from '../../domain/dtos/verifyOtpRequest.dto';
import { UserErrorType } from '../../domain/enums/userErrorType.enum';
import { AuthErrorType } from '../../domain/enums/authErrorType.enum';

interface VerifyForgotPasswordOtpResponseDTO {
  success: boolean;
  error?: string;
}

export class VerifyForgotPasswordOtpUseCase {
  constructor(private userRepository: IUsersRepository) {}

  async execute(data: IVerifyOtpRequestDTO): Promise<VerifyForgotPasswordOtpResponseDTO> {
    try {
      const user = await this.userRepository.findByEmail(data.email);
      if (!user) {
        return { success: false, error: UserErrorType.UserNotFound };
      }
      if (user.otp !== data.otp) {
        return { success: false, error: AuthErrorType.InvalidOtp };
      }
      if (!user.otpExpires || Date.now() > user.otpExpires.getTime()) {
        return { success: false, error: AuthErrorType.OtpExpired };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}