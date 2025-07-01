import { IGetMembershipPlansResponseDTO, MembershipPlanDTO } from '@/domain/dtos/getMembershipPlansResponse.dto';
import { GetMembershipPlansRequestDTO } from '@/domain/dtos/getMembershipPlansRequest.dto';
import { MembershipPlan } from '@/domain/entities/MembershipPlan.entity';
import { IMembershipsPlanRepository } from '@/app/repositories/membershipPlan.repository';
import { MembershipErrorType } from '@/domain/enums/membershipErrorType.enum';

export class GetMembershipPlansUseCase {
  constructor(private membershipsPlanRepository: IMembershipsPlanRepository) {}

  private toMembershipPlanDTO(plan: MembershipPlan): MembershipPlanDTO {
    return {
      id: plan.id || '',
      name: plan.name,
      description: plan.description,
      price: plan.price,
      duration: plan.duration,
      features: plan.features,
      createdAt: plan.createdAt instanceof Date ? plan.createdAt.toISOString() : plan.createdAt || undefined,
      updatedAt: plan.updatedAt instanceof Date ? plan.updatedAt.toISOString() : plan.updatedAt || undefined,
    };
  }

  async execute({ page = 1, limit = 3 }: GetMembershipPlansRequestDTO): Promise<IGetMembershipPlansResponseDTO> {
    if (page < 1 || limit < 1) {
      throw new Error(MembershipErrorType.InvalidPaginationParams);
    }

    const skip = (page - 1) * limit;
    const plans = await this.membershipsPlanRepository.findAllPlans(skip, limit);
    const totalPlans = await this.membershipsPlanRepository.countPlans();
    const totalPages = Math.ceil(totalPlans / limit);

    const planDTOs: MembershipPlanDTO[] = plans.map((plan) => this.toMembershipPlanDTO(plan));

    return {
      success: true,
      plans: planDTOs,
      page,
      totalPages,
      totalPlans,
    };
  }
}