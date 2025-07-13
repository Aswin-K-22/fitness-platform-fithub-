import { IUsersRepository } from '../repositories/users.repository';
import { IPasswordHasher } from '../providers/passwordHasher.service';
import { IResetPasswordRequestDTO } from '../../domain/dtos/resetPasswordRequest.dto';
import { IResetPasswordResponseDTO } from '../../domain/dtos/resetPasswordResponse.dto';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import { Email } from '../../domain/valueObjects/email.valueObject';

export class ResetPasswordUseCase {
  constructor(
    private userRepository: IUsersRepository,
    private passwordHasher: IPasswordHasher
  ) {}

  async execute(data: IResetPasswordRequestDTO): Promise<IResetPasswordResponseDTO> {
    try {
      // Validate input
      if (!data.email || !data.otp || !data.newPassword) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.AUTH_MISSING_REQUIRED_FIELDS.code,
            message: ERRORMESSAGES.AUTH_MISSING_REQUIRED_FIELDS.message,
          },
        };
      }

      // Validate email format
      const email = new Email({ address: data.email });

      // Check if user exists
      const user = await this.userRepository.findByEmail(email.address);
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

      // Verify OTP
      // if (user.otp !== data.otp) {
      //   return {
      //     success: false,
      //     status: HttpStatus.BAD_REQUEST,
      //     error: {
      //       code: ERRORMESSAGES.AUTH_INVALID_OTP.code,
      //       message: ERRORMESSAGES.AUTH_INVALID_OTP.message,
      //     },
      //   };
      // }

      // // Check OTP expiry
      // if (!user.otpExpires || user.otpExpires < new Date()) {
      //   return {
      //     success: false,
      //     status: HttpStatus.BAD_REQUEST,
      //     error: {
      //       code: ERRORMESSAGES.AUTH_OTP_EXPIRED.code,
      //       message: ERRORMESSAGES.AUTH_OTP_EXPIRED.message,
      //     },
      //   };
      // }

      // Validate new password
      if (data.newPassword.length < 6) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.USER_INVALID_PASSWORD.code,
            message: ERRORMESSAGES.USER_INVALID_PASSWORD.message,
          },
        };
      }

      // Hash new password
      const hashedPassword = await this.passwordHasher.hashPassword(data.newPassword);

      // Update password and clear OTP
      await this.userRepository.updatePassword(email.address, hashedPassword);

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.UPDATED,
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