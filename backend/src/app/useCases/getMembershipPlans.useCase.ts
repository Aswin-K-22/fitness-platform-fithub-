// src/app/useCases/getMembershipPlans.useCase.ts
import { IMembershipsPlanRepository } from '@/app/repositories/membershipPlan.repository';
import { MembershipPlanDTO } from '@/domain/dtos/IAdminMembershipPlanDTO';

export class GetMembershipPlansUseCase {
  constructor(private membershipsPlanRepository: IMembershipsPlanRepository) {}

  async execute(page: number, limit: number): Promise<{
    success: boolean;
    plans: MembershipPlanDTO[];
    page: number;
    totalPages: number;
    totalPlans: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const plans = await this.membershipsPlanRepository.findAllPlans(skip, limit);
      const totalPlans = await this.membershipsPlanRepository.countPlans();
      const totalPages = Math.ceil(totalPlans / limit);

      const plansDTO = plans.map((plan) => ({
        id: plan.id || '',
        name: plan.name,
        type: plan.type,
        description: plan.description,
        price: plan.price,
        duration: plan.duration,
        features: plan.features,
        createdAt: plan.createdAt instanceof Date ? plan.createdAt.toISOString() : plan.createdAt || '',
        updatedAt: plan.updatedAt instanceof Date ? plan.updatedAt.toISOString() : plan.updatedAt || '',
      }));

      return {
        success: true,
        plans: plansDTO,
        page,
        totalPages,
        totalPlans,
      };
    } catch (error) {
      throw new Error('Failed to fetch membership plans');
    }
  }
}