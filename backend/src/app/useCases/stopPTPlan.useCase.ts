import { IStopPTPlanUseCase } from './interfaces/IStopResumePTPlanUseCase';
import { IStopPTPlanUseCaseInputDTO, IStopPTPlanUseCaseResponseDTO } from '@/domain/dtos/stopResumePTPlanUseCase.dto';
import { IPTPlanRepository } from '@/app/repositories/ptPlan.repository';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { MESSAGES } from '@/domain/constants/messages.constant';

export class StopPTPlanUseCase implements IStopPTPlanUseCase {
  constructor(private readonly ptPlanRepository: IPTPlanRepository) {}

  async execute(data: IStopPTPlanUseCaseInputDTO): Promise<IStopPTPlanUseCaseResponseDTO> {
    try {
      const plan = await this.ptPlanRepository.findById(data.planId);
      if (!plan) {
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          error: {
            code: ERRORMESSAGES.PTPLAN_NOT_FOUND.code,
            message: ERRORMESSAGES.PTPLAN_NOT_FOUND.message,
          },
        };
      }

      // Check if the plan is already stopped
      if (!plan.isActive) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.PTPLAN_ALREADY_STOPPED.code,
            message: ERRORMESSAGES.PTPLAN_ALREADY_STOPPED.message,
          },
        };
      }

      // Check if the trainer is authorized to stop this plan
      if (plan.createdBy !== data.trainerId) {
        return {
          success: false,
          status: HttpStatus.FORBIDDEN,
          error: {
            code: ERRORMESSAGES.TRAINER_NOT_AUTHORIZED.code,
            message: ERRORMESSAGES.TRAINER_NOT_AUTHORIZED.message,
          },
        };
      }

      await this.ptPlanRepository.stop(data.planId);

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.PTPLAN_STOPPED,
      };
    } catch (error) {
      console.error('[ERROR] Stop PT plan error:', error);
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