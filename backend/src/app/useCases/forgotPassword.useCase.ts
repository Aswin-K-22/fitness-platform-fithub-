import { IUsersRepository } from '../repositories/users.repository';
import { IEmailService } from '../providers/email.service';
import { IForgotPasswordRequestDTO } from '../../domain/dtos/forgotPasswordRequest.dto';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import { IForgotPasswordResponseDTO } from '../../domain/dtos/forgotPasswordResponse.dto';
import { Email } from '../../domain/valueObjects/email.valueObject';
import { generateOtp } from '../../infra/utils/otp';

export class ForgotPasswordUseCase {
  constructor(
    private userRepository: IUsersRepository,
    private emailService: IEmailService,
  ) {}

  async execute(data: IForgotPasswordRequestDTO): Promise<IForgotPasswordResponseDTO> {
    try {
      const email = new Email({ address: data.email });
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

      console.log('user verification =', user.isVerified);
      if (!user.isVerified) {
        return {
          success: false,
          status: HttpStatus.FORBIDDEN,
          error: {
            code: ERRORMESSAGES.USER_NOT_VERIFIED.code,
            message: ERRORMESSAGES.USER_NOT_VERIFIED.message,
          },
        };
      }

      const otp = generateOtp();
      await this.userRepository.updateOtp(email.address, otp);

      await this.emailService.sendMail({
        from: process.env.EMAIL_USER || 'no-reply@fithub.com',
        to: email.address,
        subject: 'FitHub Password Reset OTP',
        text: `Your OTP to reset your password is ${otp}. It expires in 30 seconds.`,
      });
      console.log(`User OTP to reset your password is ${otp}. It expires in 30 seconds.`);

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.OTP_SENT,
        data: {},
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