import { IUsersRepository } from '../repositories/users.repository';
import { IResetPasswordRequestDTO } from '../../domain/dtos/resetPasswordRequest.dto';
import { UserErrorType } from '../../domain/enums/userErrorType.enum';
import { AuthErrorType } from '../../domain/enums/authErrorType.enum';
import { IPasswordHasher } from '../providers/passwordHasher.service';

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
      if (!data.email || !data.otp || !data.newPassword) {
        return { success: false, error: AuthErrorType.MissingRequiredFields };
      }

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

      const hashedPassword = await this.passwordHasher.hashPassword(data.newPassword);
      await this.userRepository.updatePassword(data.email, hashedPassword);

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}