// app/useCases/verifyUserOtp.useCase.ts
import { IUsersRepository } from '../repositories/users.repository';
import { IVerifyOtpRequestDTO } from '../../domain/dtos/verifyOtpRequest.dto';
import { UserErrorType } from '../../domain/enums/userErrorType.enum';
import { UserAuthResponseDTO } from '@/domain/dtos/userAuthResponse.dto';
import { ITokenService } from '../providers/token.service';

interface VerifyUserOtpResponseDTO {
  success: boolean;
   data?: {
      user: UserAuthResponseDTO;
         accessToken: string;
    refreshToken: string;
   },
  error?: string;
}

export class VerifyUserOtpUseCase {
  constructor(
    private userRepository: IUsersRepository,
   private tokenService: ITokenService,
  ) {}

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
        return { success: false, error: UserErrorType.InvalidOTP };
      }

      await this.userRepository.verifyUser(data.email);

       const userAuth: UserAuthResponseDTO = {
        id: user.id || '', // Ensure id is always a string
        email: user.email.address,
        name: user.name,
        role: user.role as 'user' | 'admin' | 'trainer',
        profilePic: user.profilePic,
        isVerified: true,
      };

      const accessToken = await this.tokenService.generateAccessToken({ email: user.email.address, id: user.id });
      const refreshToken = await this.tokenService.generateRefreshToken({ email: user.email.address, id: user.id });
       
      return { success: true ,data :{user : userAuth , accessToken, refreshToken } };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}