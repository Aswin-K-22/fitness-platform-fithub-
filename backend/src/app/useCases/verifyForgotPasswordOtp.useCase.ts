import { IUsersRepository } from '../repositories/users.repository';
import { IVerifyOtpRequestDTO } from '../../domain/dtos/verifyOtpRequest.dto';
import { IVerifyForgotPasswordOtpResponseDTO } from '../../domain/dtos/verifyForgotPasswordOtpResponse.dto';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';

export class VerifyForgotPasswordOtpUseCase {
  constructor(private userRepository: IUsersRepository) {}

  async execute(data: IVerifyOtpRequestDTO): Promise<IVerifyForgotPasswordOtpResponseDTO> {
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

      if (user.otp !== data.otp) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.AUTH_INVALID_OTP.code,
            message: ERRORMESSAGES.AUTH_INVALID_OTP.message,
          },
        };
      }

      if (!user.otpExpires || Date.now() > user.otpExpires.getTime()) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.AUTH_OTP_EXPIRED.code,
            message: ERRORMESSAGES.AUTH_OTP_EXPIRED.message,
          },
        };
      }

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.OTP_VERIFIED,
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