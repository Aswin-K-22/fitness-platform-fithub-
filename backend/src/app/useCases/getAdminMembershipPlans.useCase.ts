// src/app/useCases/getAdminMembershipPlans.useCase.ts
import { IMembershipsPlanRepository } from '@/app/repositories/membershipPlan.repository';
import { MembershipErrorType } from '@/domain/enums/membershipErrorType.enum';
import { MembershipPlan } from '@/domain/entities/MembershipPlan.entity';
import { MembershipPlanDTO } from '@/domain/dtos/IAdminMembershipPlanDTO';
import { IGetAdminMembershipPlansRequestDTO } from '@/domain/dtos/getAdminMembershipPlansRequest.dto';
import { IGetAdminMembershipPlansResponseDTO } from '@/domain/dtos/getAdminMembershipPlansResponse.dto';

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
        throw new Error(MembershipErrorType.InvalidPagination);
      }

      const skip = (page - 1) * limit;
      const plans = await this.membershipsPlanRepository.findAllPlans(skip, limit);
      const total = await this.membershipsPlanRepository.countPlans();
      const pages = Math.ceil(total / limit);

      return {
        success: true,
        plans: plans.map(this.toMembershipPlanDTO),
        total,
        pages,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === MembershipErrorType.InvalidPagination) {
          throw error;
        }
        throw new Error(MembershipErrorType.DatabaseError);
      }
      throw new Error(MembershipErrorType.UnknownError);
    }
  }
}