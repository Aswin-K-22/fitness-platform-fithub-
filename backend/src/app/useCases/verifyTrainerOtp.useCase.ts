import { ITrainersRepository } from '../repositories/trainers.repository';
import { IVerifyTrainerOtpRequestDTO, VerifyTrainerOtpRequestDTO } from '../../domain/dtos/verifyTrainerOtpRequest.dto';
import { TrainerErrorType } from '../../domain/enums/trainerErrorType.enum';
import { AuthErrorType } from '../../domain/enums/authErrorType.enum';

interface VerifyTrainerOtpResult {
  success: boolean;
  error?: string;
}

export class VerifyTrainerOtpUseCase {
  constructor(private trainersRepository: ITrainersRepository) {}

  async execute(data: IVerifyTrainerOtpRequestDTO): Promise<VerifyTrainerOtpResult> {
    try {
      const dto = new VerifyTrainerOtpRequestDTO(data);

      const trainer = await this.trainersRepository.findByEmail(dto.email);
      if (!trainer) {
        return { success: false, error: TrainerErrorType.TrainerNotFound };
      }

      if (trainer.isVerified) {
        return { success: false, error: TrainerErrorType.AlreadyVerified };
      }

      if (!trainer.otp || trainer.otp !== dto.otp || !trainer.otpExpires || trainer.otpExpires < new Date()) {
        return { success: false, error: AuthErrorType.InvalidOtp };
      }

      await this.trainersRepository.verifyTrainer(dto.email);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Internal server error' };
    }
  }
}