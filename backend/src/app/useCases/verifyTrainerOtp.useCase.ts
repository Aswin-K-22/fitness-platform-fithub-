import { ITrainersRepository } from '../repositories/trainers.repository';
import { IVerifyTrainerOtpRequestDTO } from '../../domain/dtos/verifyTrainerOtpRequest.dto';
import { TrainerErrorType } from '../../domain/enums/trainerErrorType.enum';

interface VerifyTrainerOtpResponseDTO {
  success: boolean;
  error?: string;
}

export class VerifyTrainerOtpUseCase {
  constructor(private trainerRepository: ITrainersRepository) {}

  async execute(data: IVerifyTrainerOtpRequestDTO): Promise<VerifyTrainerOtpResponseDTO> {
    try {
      const trainer = await this.trainerRepository.findByEmail(data.email);
      if (!trainer) {
        return { success: false, error: TrainerErrorType.TrainerNotFound };
      }

      if (trainer.isVerified) {
        return { success: false, error: TrainerErrorType.AlreadyVerified };
      }

      if (trainer.otp !== data.otp || !trainer.otpExpires || trainer.otpExpires < new Date()) {
        return { success: false, error: TrainerErrorType.InvalidCredentials };
      }

      await this.trainerRepository.verifyTrainer(data.email);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}