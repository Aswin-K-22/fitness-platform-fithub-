import { ITrainersRepository } from '@/app/repositories/trainers.repository';
import { TrainerErrorType } from '@/domain/enums/trainerErrorType.enum';

export interface GetAvailableTrainersResponseDTO {
  success: boolean;
  trainers: { id: string; name: string; active: boolean }[];
}

export class GetAvailableTrainersUseCase {
  constructor(private trainersRepository: ITrainersRepository) {}

  async execute(): Promise<GetAvailableTrainersResponseDTO> {
    try {
      const trainers = await this.trainersRepository.findAvailableTrainers();
      return {
        success: true,
        trainers,
      };
    } catch (error) {
      throw new Error(TrainerErrorType.FailedToFetchTrainers);
    }
  }
}