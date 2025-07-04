// src/app/useCases/addMembershipPlan.useCase.ts
import { IMembershipsPlanRepository } from '@/app/repositories/membershipPlan.repository';
import { IAddMembershipPlanRequestDTO, AddMembershipPlanRequestSchema } from '@/domain/dtos/IAddMembershipPlanRequestDTO';
import { IAddMembershipPlanResponseDTO } from '@/domain/dtos/IAddMembershipPlanResponseDTO';
import { MembershipErrorType } from '@/domain/enums/membershipErrorType.enum';
import { MembershipPlan } from '@/domain/entities/MembershipPlan.entity';
import { MembershipPlanDTO } from '@/domain/dtos/IAdminMembershipPlanDTO';

export class AddMembershipPlanUseCase {
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

  async execute(data: IAddMembershipPlanRequestDTO): Promise<IAddMembershipPlanResponseDTO> {
    try {
      // Validate input
      const validatedData = AddMembershipPlanRequestSchema.parse(data);

      // Check for existing plan with the same name
      const existingPlan = await this.membershipsPlanRepository.findByName(validatedData.name);
      if (existingPlan) {
        throw new Error(MembershipErrorType.PlanAlreadyExists);
      }

      // Create plan instance
      const planData = new MembershipPlan({
        name: validatedData.name,
        type: validatedData.type,
        description: validatedData.description,
        price: validatedData.price,
        duration: validatedData.duration,
        features: validatedData.features,
        // id is optional and not provided for new plans
      });

      const newPlan = await this.membershipsPlanRepository.createPlan(planData);

      return {
        success: true,
        plan: this.toMembershipPlanDTO(newPlan),
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === MembershipErrorType.PlanAlreadyExists) {
          throw error;
        }
        throw new Error(MembershipErrorType.DatabaseError);
      }
      throw new Error(MembershipErrorType.UnknownError);
    }
  }
}