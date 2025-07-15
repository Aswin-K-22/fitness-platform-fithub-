import { ITrainersRepository } from '../repositories/trainers.repository';
import { IEmailService } from '../providers/email.service';
import { IResendOtpRequestDTO } from '../../domain/dtos/resendOtpRequest.dto';
import { IResendTrainerOtpResponseDTO } from '../../domain/dtos/resendTrainerOtpResponse.dto';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import { generateOtp } from '../../infra/utils/otp';
import { IResendTrainerOtpUseCase } from './interfaces/IResendTrainerOtpUseCase';

export class ResendTrainerOtpUseCase implements IResendTrainerOtpUseCase {
  constructor(
    private trainersRepository: ITrainersRepository,
    private emailService: IEmailService
  ) {}

  async execute(data: IResendOtpRequestDTO): Promise<IResendTrainerOtpResponseDTO> {
    try {

      const trainer = await this.trainersRepository.findByEmail(data.email);
      if (!trainer) {
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          error: {
            code: ERRORMESSAGES.TRAINER_NOT_FOUND.code,
            message: ERRORMESSAGES.TRAINER_NOT_FOUND.message,
          },
        };
      }

      if (trainer.isVerified) {
        return {
          success: false,
          status: HttpStatus.CONFLICT,
          error: {
            code: ERRORMESSAGES.TRAINER_ALREADY_VERIFIED.code,
            message: ERRORMESSAGES.TRAINER_ALREADY_VERIFIED.message,
          },
        };
      }

      const otp = generateOtp();
      await this.trainersRepository.updateOtp(data.email, otp);

      await this.emailService.sendMail({
        from: process.env.EMAIL_USER || 'no-reply@fithub.com',
        to: data.email,
        subject: 'FitHub Trainer Signup - OTP Verification',
        text: `Your new OTP is ${otp}. It expires in 30 seconds.`,
      });
      console.log(`Trainer resend new OTP is ${otp}. It expires in 30 seconds.`);

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