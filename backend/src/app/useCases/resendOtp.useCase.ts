import { IUsersRepository } from '../repositories/users.repository';
import { IResendOtpRequestDTO } from '../../domain/dtos/resendOtpRequest.dto';
import { IResendOtpResponseDTO } from '@/domain/dtos/resendOtpResponse.dto';
import { IEmailService } from '../providers/email.service';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import { generateOtp } from '../../infra/utils/otp';
import { IResendOtpUseCase } from './interfaces/IResendOtpUseCase';

export class ResendOtpUseCase implements IResendOtpUseCase {
  constructor(
    private userRepository: IUsersRepository,
    private emailService: IEmailService
  ) {}

  async execute(data: IResendOtpRequestDTO): Promise<IResendOtpResponseDTO> {
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

      const otp = generateOtp();
      await this.userRepository.updateOtp(data.email, otp);

      await this.emailService.sendMail({
        from: process.env.EMAIL_USER || 'no-reply@fithub.com',
        to: data.email,
        subject: 'FitHub OTP Verification',
        text: `Your new OTP is ${otp}. It expires in 30 seconds.`,
      });
      console.log(`Resend new OTP is ${otp}. It expires in 30 seconds.`);

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.OTP_SENT,
      };
    } catch (error) {
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: ERRORMESSAGES.AUTH_EMAIL_SEND_FAILED.code,
          message: ERRORMESSAGES.AUTH_EMAIL_SEND_FAILED.message,
        },
      };
    }
  }
}