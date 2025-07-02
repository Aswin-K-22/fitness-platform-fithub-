import { ITrainersRepository } from '../repositories/trainers.repository';
import { IGetTrainerResponseDTO, TrainerAuth } from '../../domain/dtos/getTrainerResponse.dto';
import { TrainerErrorType } from '../../domain/enums/trainerErrorType.enum';

export class GetTrainerUseCase {
  constructor(private trainersRepository: ITrainersRepository) {}

  async execute(email: string): Promise<IGetTrainerResponseDTO> {
    try {
      const trainer = await this.trainersRepository.findByEmail(email);
      if (!trainer) {
        throw new Error(TrainerErrorType.TrainerNotFound);
      }

      const trainerResponse: TrainerAuth = {
        id: trainer.id!,
        email: trainer.email.address,
        name: trainer.name,
        role: trainer.role,
        profilePic: trainer.profilePic || null,
        isVerified: trainer.isVerified,
        verifiedByAdmin: trainer.verifiedByAdmin,
      };

      return { trainer: trainerResponse };
    } catch (error: any) {
      console.error('[ERROR] Get trainer error:', error);
      throw new Error(TrainerErrorType.TrainerNotFound);
    }
  }
}