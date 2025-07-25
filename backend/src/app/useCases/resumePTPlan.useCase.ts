import { IResumePTPlanUseCase } from './interfaces/IStopResumePTPlanUseCase';
import { IResumePTPlanUseCaseInputDTO, IResumePTPlanUseCaseResponseDTO } from '@/domain/dtos/stopResumePTPlanUseCase.dto';
import { IPTPlanRepository } from '@/app/repositories/ptPlan.repository';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { MESSAGES } from '@/domain/constants/messages.constant';

export class ResumePTPlanUseCase implements IResumePTPlanUseCase {
  constructor(private readonly ptPlanRepository: IPTPlanRepository) {}

  async execute(data: IResumePTPlanUseCaseInputDTO): Promise<IResumePTPlanUseCaseResponseDTO> {
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

      // Check if the plan is already active
      if (plan.isActive) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.PTPLAN_ALREADY_ACTIVE.code,
            message: ERRORMESSAGES.PTPLAN_ALREADY_ACTIVE.message,
          },
        };
      }

      // Check if the trainer is authorized to resume this plan
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

      await this.ptPlanRepository.resume(data.planId);

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.PTPLAN_RESUMED,
      };
    } catch (error) {
      console.error('[ERROR] Resume PT plan error:', error);
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