import { ITrainersRepository } from '../repositories/trainers.repository';
import { ILogoutRequestDTO } from '../../domain/dtos/logoutRequest.dto';
import { TrainerErrorType } from '../../domain/enums/trainerErrorType.enum';

interface LogoutResponseDTO {
  success: boolean;
  error?: string;
}

export class LogoutTrainerUseCase {
  constructor(private trainerRepository: ITrainersRepository) {}

  async execute(data: ILogoutRequestDTO): Promise<LogoutResponseDTO> {
    try {
      console.log(`[DEBUG] Attempting logout for email: ${data.email}`);
      const trainer = await this.trainerRepository.findByEmail(data.email);
      if (!trainer) {
        console.log(`[DEBUG] Trainer not found for email: ${data.email}`);
        return { success: false, error: TrainerErrorType.TrainerNotFound };
      }

      await this.trainerRepository.updateRefreshToken(data.email, null);
      console.log(`[DEBUG] Refresh token cleared for email: ${data.email}`);
      return { success: true };
    } catch (error) {
      console.error(`[ERROR] Logout failed for email: ${data.email}`, error);
      return { success: false, error: (error as Error).message || 'Internal server error' };
    }
  }
}