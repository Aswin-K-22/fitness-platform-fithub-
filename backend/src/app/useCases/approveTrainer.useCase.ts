import { ITrainersRepository } from '../repositories/trainers.repository';
import { IApproveTrainerRequestDTO } from '../../domain/dtos/approveTrainerRequest.dto';
import { IApproveTrainerResponseDTO } from '../../domain/dtos/approveTrainerResponse.dto';
import { TrainerErrorType } from '../../domain/enums/trainerErrorType.enum';

export class ApproveTrainerUseCase {
  constructor(private trainersRepository: ITrainersRepository) {}

  async execute(data: IApproveTrainerRequestDTO): Promise<IApproveTrainerResponseDTO> {
    if (!data.trainerId) {
      throw new Error(TrainerErrorType.InvalidTrainerId);
    }

    const trainer = await this.trainersRepository.findById(data.trainerId);
    if (!trainer) {
      throw new Error(TrainerErrorType.TrainerNotFound);
    }

    const verifiedByAdmin = !trainer.verifiedByAdmin; // Toggle approval status
    const updatedTrainer = await this.trainersRepository.toggleApproval(data.trainerId, verifiedByAdmin);

   return { trainer: updatedTrainer.toJSON() };
  }
}