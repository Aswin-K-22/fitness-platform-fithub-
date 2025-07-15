import { ITrainersRepository } from '../repositories/trainers.repository';
import { IApproveTrainerRequestDTO } from '../../domain/dtos/approveTrainerRequest.dto';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import { IApproveTrainerResponseDTO } from '@/domain/dtos/approveTrainerResponse.dto';
import { IApproveTrainerUseCase } from './interfaces/IApproveTrainerUseCase';



export class ApproveTrainerUseCase implements IApproveTrainerUseCase {
  constructor(private trainersRepository: ITrainersRepository) {}

  async execute(data: IApproveTrainerRequestDTO): Promise<IApproveTrainerResponseDTO> {
    try {
      if (!data.trainerId) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.TRAINER_INVALID_TRAINER_ID.code,
            message: ERRORMESSAGES.TRAINER_INVALID_TRAINER_ID.message,
          },
        };
      }

      const trainer = await this.trainersRepository.findById(data.trainerId);
      if (!trainer) {
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          error: {
            code: ERRORMESSAGES.TRAINER_NOT_FOUND.code,
            message: ERRORMESSAGES.TRAINER_NOT_FOUND.message,
          },
        };
      }

      const verifiedByAdmin = !trainer.verifiedByAdmin; // Toggle approval status
      const updatedTrainer = await this.trainersRepository.toggleApproval(data.trainerId, verifiedByAdmin);

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.TRAINER_APPROVED,
        data: { trainer: updatedTrainer.toJSON() },
      };
    } catch (error) {
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: ERRORMESSAGES.GENERIC_ERROR.code,
          message: ERRORMESSAGES.GENERIC_ERROR.message,
        },
      };
    }
  }
}