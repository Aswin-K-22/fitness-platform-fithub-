// src/app/useCases/admin/updatePTPlanAdminPriceUseCase.ts
import { IUpdateAdminPriceRequestDTO } from '@/domain/dtos/updateAdminPriceRequestDTO';
import { IResponseDTO } from '@/domain/dtos/response.dto';
import { IPTPlanRepository } from '@/app/repositories/ptPlan.repository';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { MESSAGES } from '@/domain/constants/messages.constant';
import { IUpdatePTPlanAdminPriceUseCase } from './interfeces/IUpdatePTPlanAdminPriceUseCase';

export class UpdatePTPlanAdminPriceUseCase implements IUpdatePTPlanAdminPriceUseCase {
  constructor(private readonly ptPlanRepository: IPTPlanRepository) {}

  async execute(data: IUpdateAdminPriceRequestDTO): Promise<IResponseDTO<null>> {
    try {
      const { planId, adminPrice } = data;

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

      const totalPrice = plan.trainerPrice + adminPrice;
      await this.ptPlanRepository.updateAdminPrice(planId, adminPrice, totalPrice);

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.PTPLAN_ADMIN_PRICE_UPDATED,
        data: null,
      };
    } catch (error) {
      console.error('[ERROR] Update PT Plan Admin Price error:', error);
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