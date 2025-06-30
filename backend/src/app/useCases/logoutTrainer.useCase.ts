import { ITrainersRepository } from '../repositories/trainers.repository';
import { ILogoutRequestDTO } from '../../domain/dtos/logoutRequest.dto';
import { TrainerErrorType } from '../../domain/enums/trainerErrorType.enum';

interface LogoutResponseDTO {
  success: boolean;
  error?: string;
}

export class LogoutTrainerUseCase {
  constructor(private trainerRepository: ITrainersRepository) {}

  async execute(data:ILogoutRequestDTO): Promise<LogoutResponseDTO> {
    try {
      const trainer = await this.trainerRepository.findByEmail(data.email);
      if (!trainer) {
        return { success: false, error: TrainerErrorType.TrainerNotFound };
      }

      await this.trainerRepository.updateRefreshToken(data.email, null);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}