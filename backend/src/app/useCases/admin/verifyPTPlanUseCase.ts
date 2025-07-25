// src/app/useCases/admin/verifyPTPlanUseCase.ts
import { IVerifyPTPlanRequestDTO } from '@/domain/dtos/verifyPTPlanRequestDTO';
import { IResponseDTO } from '@/domain/dtos/response.dto';
import { IPTPlanRepository } from '@/app/repositories/ptPlan.repository';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { MESSAGES } from '@/domain/constants/messages.constant';
import { IVerifyPTPlanUseCase } from './interfeces/IVerifyPTPlanUseCase';

export class VerifyPTPlanUseCase implements IVerifyPTPlanUseCase {
  constructor(private readonly ptPlanRepository: IPTPlanRepository) {}

  async execute(data: IVerifyPTPlanRequestDTO): Promise<IResponseDTO<null>> {
    try {
      const { planId, verifiedByAdmin } = data;

      const plan = await this.ptPlanRepository.findById(planId);
      if (!plan) {
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: ERRORMESSAGES.PTPLAN_NOT_FOUND.message,
          error: {
            code: ERRORMESSAGES.PTPLAN_NOT_FOUND.code,
            message: ERRORMESSAGES.PTPLAN_NOT_FOUND.message,
          },
        };
      }

await this.ptPlanRepository.adminVerifyPTPlan(planId, verifiedByAdmin);

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.PTPLAN_VERIFIED,
        data: null,
      };
    } catch (error) {
      console.error('[ERROR] Verify PT Plan error:', error);
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ERRORMESSAGES.GENERIC_ERROR.message,
        error: {
          code: ERRORMESSAGES.GENERIC_ERROR.code,
          message: ERRORMESSAGES.GENERIC_ERROR.message,
        },
      };
    }
  }
}