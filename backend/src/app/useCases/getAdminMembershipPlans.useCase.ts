import { IMembershipsPlanRepository } from '@/app/repositories/membershipPlan.repository';
import { MembershipPlan } from '@/domain/entities/MembershipPlan.entity';
import { MembershipPlanDTO } from '@/domain/dtos/IAdminMembershipPlanDTO';
import { IGetAdminMembershipPlansRequestDTO } from '@/domain/dtos/getAdminMembershipPlansRequest.dto';
import { IGetAdminMembershipPlansResponseDTO } from '@/domain/dtos/getAdminMembershipPlansResponse.dto';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { MESSAGES } from '@/domain/constants/messages.constant';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';

export class GetAdminMembershipPlansUseCase {
  constructor(private membershipsPlanRepository: IMembershipsPlanRepository) {}

  private toMembershipPlanDTO(plan: MembershipPlan): MembershipPlanDTO {
    return {
      id: plan.id || '',
      name: plan.name,
      type: plan.type,
      description: plan.description,
      price: plan.price,
      duration: plan.duration,
      features: plan.features,
      createdAt: plan.createdAt instanceof Date ? plan.createdAt.toISOString() : plan.createdAt || '',
      updatedAt: plan.updatedAt instanceof Date ? plan.updatedAt.toISOString() : plan.updatedAt || '',
    };
  }

  async execute(data: IGetAdminMembershipPlansRequestDTO): Promise<IGetAdminMembershipPlansResponseDTO> {
    try {
      const { page, limit } = data;
      if (page < 1 || limit < 1) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.MEMBERSHIP_INVALID_PAGINATION.code,
            message: ERRORMESSAGES.MEMBERSHIP_INVALID_PAGINATION.message,
          },
        };
      }

      const skip = (page - 1) * limit;
      const plans = await this.membershipsPlanRepository.findAllPlans(skip, limit);
      const total = await this.membershipsPlanRepository.countPlans();
      const pages = Math.ceil(total / limit);

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.SUCCESS,
        data: {
          plans: plans.map(this.toMembershipPlanDTO),
          total,
          pages,
        },
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