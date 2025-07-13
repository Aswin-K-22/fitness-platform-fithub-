import { ITrainersRepository } from '@/app/repositories/trainers.repository';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { MESSAGES } from '@/domain/constants/messages.constant';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { IGetAvailableTrainersResponseDTO } from '@/domain/dtos/getAvailableTrainersResponse.dto';

export class GetAvailableTrainersUseCase {
  constructor(private trainersRepository: ITrainersRepository) {}

  async execute(): Promise<IGetAvailableTrainersResponseDTO> {
    try {
      const trainers = await this.trainersRepository.findAvailableTrainers();
      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.SUCCESS,
        data: { trainers },
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