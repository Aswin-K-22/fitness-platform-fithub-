import { IUsersRepository } from '../repositories/users.repository';
import { IPasswordHasher } from '../providers/passwordHasher.service';
import { IResetPasswordRequestDTO } from '../../domain/dtos/resetPasswordRequest.dto';
import { UserErrorType } from '../../domain/enums/userErrorType.enum';
import { AuthErrorType } from '../../domain/enums/authErrorType.enum';
import { Email } from '../../domain/valueObjects/email.valueObject';

interface ResetPasswordResponseDTO {
  success: boolean;
  error?: string;
}

export class ResetPasswordUseCase {
  constructor(
    private userRepository: IUsersRepository,
    private passwordHasher: IPasswordHasher,
  ) {}

  async execute(data: IResetPasswordRequestDTO): Promise<ResetPasswordResponseDTO> {
    try {
      // Validate input
      if (!data.email || !data.otp || !data.newPassword) {
        return { success: false, error: UserErrorType.MissingRequiredFields };
      }

      // Validate email format
      const email = new Email({ address: data.email });

      // Check if user exists
      const user = await this.userRepository.findByEmail(email.address);
      if (!user) {
        return { success: false, error: UserErrorType.UserNotFound };
      }

      // Verify OTP
      // if (user.otp !== data.otp) {
      //   return { success: false, error: AuthErrorType.InvalidOtp };
      // }

      // // Check OTP expiry
      // if (!user.otpExpires || user.otpExpires < new Date()) {
      //   return { success: false, error: AuthErrorType.OtpExpired };
      // }

      // Validate new password
      //|| !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(data.newPassword)
      if (data.newPassword.length < 6 ) {
        return { success: false, error: UserErrorType.InvalidPassword };
      }

      // Hash new password
      const hashedPassword = await this.passwordHasher.hashPassword(data.newPassword);

      // Update password and clear OTP
      await this.userRepository.updatePassword(email.address, hashedPassword);

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}