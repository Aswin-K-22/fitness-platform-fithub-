import { IUsersRepository } from '../repositories/users.repository';
import { IVerifyOtpRequestDTO } from '../../domain/dtos/verifyOtpRequest.dto';
import { IVerifyUserOtpResponseDTO } from '../../domain/dtos/verifyUserOtpResponse.dto';
import { UserAuthResponseDTO } from '../../domain/dtos/userAuthResponse.dto';
import { ITokenService } from '../providers/token.service';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';

export class VerifyUserOtpUseCase {
  constructor(
    private userRepository: IUsersRepository,
    private tokenService: ITokenService,
  ) {}

  async execute(data: IVerifyOtpRequestDTO): Promise<IVerifyUserOtpResponseDTO> {
    try {
      const user = await this.userRepository.findByEmail(data.email);
      if (!user) {
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          error: {
            code: ERRORMESSAGES.USER_NOT_FOUND.code,
            message: ERRORMESSAGES.USER_NOT_FOUND.message,
          },
        };
      }

      if (user.isVerified) {
        return {
          success: false,
          status: HttpStatus.CONFLICT,
          error: {
            code: ERRORMESSAGES.USER_ALREADY_VERIFIED.code,
            message: ERRORMESSAGES.USER_ALREADY_VERIFIED.message,
          },
        };
      }

      if (user.otp !== data.otp || !user.otpExpires || user.otpExpires < new Date()) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.USER_INVALID_OTP.code,
            message: ERRORMESSAGES.USER_INVALID_OTP.message,
          },
        };
      }

      await this.userRepository.verifyUser(data.email);

      const userAuth: UserAuthResponseDTO = {
        id: user.id || '',
        email: user.email.address,
        name: user.name,
        role: user.role as 'user' | 'admin' | 'trainer',
        profilePic: user.profilePic,
        isVerified: true,
      };

      const accessToken = await this.tokenService.generateAccessToken({ email: user.email.address, id: user.id });
      const refreshToken = await this.tokenService.generateRefreshToken({ email: user.email.address, id: user.id });

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.OTP_VERIFIED,
        data: { user: userAuth, accessToken, refreshToken },
      };
    } catch (error) {
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: ERRORMESSAGES.GENERIC_ERROR.code,
          message: ERRORMESSAGES.GENERIC_ERROR.message,
        },
      };
    }
  }
}