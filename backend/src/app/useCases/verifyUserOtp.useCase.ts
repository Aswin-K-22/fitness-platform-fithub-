// app/useCases/verifyUserOtp.useCase.ts
import { IUsersRepository } from '../repositories/users.repository';
import { IVerifyOtpRequestDTO } from '../../domain/dtos/verifyOtpRequest.dto';
import { UserErrorType } from '../../domain/enums/userErrorType.enum';

interface VerifyUserOtpResponseDTO {
  success: boolean;
  error?: string;
}

export class VerifyUserOtpUseCase {
  constructor(private userRepository: IUsersRepository) {}

  async execute(data: IVerifyOtpRequestDTO): Promise<VerifyUserOtpResponseDTO> {
    try {
      const user = await this.userRepository.findByEmail(data.email);
      if (!user) {
        return { success: false, error: UserErrorType.UserNotFound };
      }

      if (user.isVerified) {
        return { success: false, error: UserErrorType.UserAlreadyVerified };
      }

      if (user.otp !== data.otp || !user.otpExpires || user.otpExpires < new Date()) {
        return { success: false, error: UserErrorType.InvalidCredentials };
      }

      await this.userRepository.verifyUser(data.email);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}