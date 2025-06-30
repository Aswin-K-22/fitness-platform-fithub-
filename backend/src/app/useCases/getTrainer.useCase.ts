// backend/src/app/useCases/getTrainer.useCase.ts
import { ITrainersRepository } from '../repositories/trainers.repository';
import { TrainerErrorType } from '../../domain/enums/trainerErrorType.enum';
import { ITrainerOutRequestDTO, Result } from '../../domain/dtos/trainerOutRequest.dto';
import { Trainer } from '../../domain/entities/Trainer.entity';

export class GetTrainerUseCase {
  constructor(private trainerRepository: ITrainersRepository) {}

  async execute(email: string): Promise<Result<ITrainerOutRequestDTO>> {
    if (!email) {
      return {
        success: false,
        error: TrainerErrorType.NOT_AUTHENTICATED,
      };
    }

    const trainer = await this.trainerRepository.findByEmail(email);
    if (!trainer) {
      return {
        success: false,
        error: TrainerErrorType.TrainerNotFound,
      };
    }

    return {
      success: true,
      data: {
        id: trainer.id,
        email: trainer.email,
        name: trainer.name,
        role: trainer.role,
        isVerified: trainer.isVerified,
        verifiedByAdmin: trainer.verifiedByAdmin,
        profilePic: trainer.profilePic,
      },
    };
  }
}