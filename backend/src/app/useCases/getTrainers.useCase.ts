import { ITrainersRepository } from '../repositories/trainers.repository';
import { IGetTrainersRequestDTO } from '../../domain/dtos/getTrainersRequest.dto';
import { IGetTrainersResponseDTO } from '../../domain/dtos/getTrainersResponse.dto';
import { TrainerErrorType } from '../../domain/enums/trainerErrorType.enum';

export class GetTrainersUseCase {
  constructor(private trainersRepository: ITrainersRepository) {}

  async execute(data: IGetTrainersRequestDTO): Promise<IGetTrainersResponseDTO> {
    const page = data.page ?? 1;
    const limit = data.limit ?? 3;
    const skip = (page - 1) * limit;

    if (page < 1 || limit < 1) {
      throw new Error(TrainerErrorType.FailedToFetchTrainers);
    }

    try {
      const [trainers, totalTrainers, pendingApproval, activeTrainers, suspended] = await Promise.all([
        this.trainersRepository.findAll(skip, limit, data.search, data.status, data.specialization),
        this.trainersRepository.count(data.search, data.status, data.specialization),
        this.trainersRepository.countPending(),
        this.trainersRepository.countApproved(),
        this.trainersRepository.countSuspended(),
      ]);

      return {
        trainers: trainers.map((trainer) => trainer.toJSON()), // Use toJSON for serialization
        stats: {
          totalTrainers,
          pendingApproval,
          activeTrainers,
          suspended,
        },
        totalPages: Math.ceil(totalTrainers / limit),
      };
    } catch (error) {
      throw new Error(TrainerErrorType.FailedToFetchTrainers);
    }
  }
}