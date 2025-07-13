import { ITrainersRepository } from '../repositories/trainers.repository';
import { IGetTrainersRequestDTO } from '../../domain/dtos/getTrainersRequest.dto';
import { IGetTrainersResponseDTO } from '../../domain/dtos/getTrainersResponse.dto';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';

export class GetTrainersUseCase {
  constructor(private trainersRepository: ITrainersRepository) {}

  async execute(data: IGetTrainersRequestDTO): Promise<IGetTrainersResponseDTO> {
    try {
      const page = data.page ?? 1;
      const limit = data.limit ?? 3;
      const skip = (page - 1) * limit;

      if (page < 1 || limit < 1) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.TRAINER_FAILED_TO_FETCH_TRAINERS.code,
            message: ERRORMESSAGES.TRAINER_FAILED_TO_FETCH_TRAINERS.message,
          },
        };
      }

      const [trainers, totalTrainers, pendingApproval, activeTrainers, suspended] = await Promise.all([
        this.trainersRepository.findAll(skip, limit, data.search, data.status, data.specialization),
        this.trainersRepository.count(data.search, data.status, data.specialization),
        this.trainersRepository.countPending(),
        this.trainersRepository.countApproved(),
        this.trainersRepository.countSuspended(),
      ]);

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.SUCCESS,
        data: {
          trainers: trainers.map((trainer) => trainer.toJSON()),
          stats: {
            totalTrainers,
            pendingApproval,
            activeTrainers,
            suspended,
          },
          totalPages: Math.ceil(totalTrainers / limit),
        },
      };
    } catch (error) {
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: ERRORMESSAGES.TRAINER_FAILED_TO_FETCH_TRAINERS.code,
          message: ERRORMESSAGES.TRAINER_FAILED_TO_FETCH_TRAINERS.message,
        },
      };
    }
  }
}