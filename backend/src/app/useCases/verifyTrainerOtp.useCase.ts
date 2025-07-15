import { ITrainersRepository } from '../repositories/trainers.repository';
import { IVerifyTrainerOtpRequestDTO, VerifyTrainerOtpRequestDTO } from '../../domain/dtos/verifyTrainerOtpRequest.dto';
import { IVerifyTrainerOtpResponseDTO } from '../../domain/dtos/verifyTrainerOtpResponse.dto';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import { IVerifyTrainerOtpUseCase } from './interfaces/IVerifyTrainerOtpUseCase';

export class VerifyTrainerOtpUseCase implements IVerifyTrainerOtpUseCase {
  constructor(private trainersRepository: ITrainersRepository) {}

  async execute(data: IVerifyTrainerOtpRequestDTO): Promise<IVerifyTrainerOtpResponseDTO> {
    try {
      const dto = new VerifyTrainerOtpRequestDTO(data);

      const trainer = await this.trainersRepository.findByEmail(dto.email);
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

      if (!trainer.otp || trainer.otp !== dto.otp || !trainer.otpExpires || trainer.otpExpires < new Date()) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.TRAINER_INVALID_OTP.code,
            message: ERRORMESSAGES.TRAINER_INVALID_OTP.message,
          },
        };
      }

      await this.trainersRepository.verifyTrainer(dto.email);

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