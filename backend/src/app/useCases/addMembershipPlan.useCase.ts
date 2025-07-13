import { IMembershipsPlanRepository } from '@/app/repositories/membershipPlan.repository';
import { IAddMembershipPlanRequestDTO, AddMembershipPlanRequestSchema } from '@/domain/dtos/IAddMembershipPlanRequestDTO';
import { MembershipPlan } from '@/domain/entities/MembershipPlan.entity';
import { MembershipPlanDTO } from '@/domain/dtos/IAdminMembershipPlanDTO';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { MESSAGES } from '@/domain/constants/messages.constant';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';

interface IAddMembershipPlanResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  data?: { plan: MembershipPlanDTO };
  error?: { code: string; message: string };
}

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
        return {
          success: false,
          status: HttpStatus.CONFLICT,
          error: {
            code: ERRORMESSAGES.MEMBERSHIP_PLAN_ALREADY_EXISTS.code,
            message: ERRORMESSAGES.MEMBERSHIP_PLAN_ALREADY_EXISTS.message,
          },
        };
      }

      // Create plan instance
      const planData = new MembershipPlan({
        name: validatedData.name,
        type: validatedData.type,
        description: validatedData.description,
        price: validatedData.price,
        duration: validatedData.duration,
        features: validatedData.features,
      });

      const newPlan = await this.membershipsPlanRepository.createPlan(planData);

      return {
        success: true,
        status: HttpStatus.CREATED,
        message: MESSAGES.MEMBERSHIP_CREATED,
        data: { plan: this.toMembershipPlanDTO(newPlan) },
      };
    } catch (error) {
      if (error instanceof Error && error.message === ERRORMESSAGES.MEMBERSHIP_PLAN_ALREADY_EXISTS.code) {
        return {
          success: false,
          status: HttpStatus.CONFLICT,
          error: {
            code: ERRORMESSAGES.MEMBERSHIP_PLAN_ALREADY_EXISTS.code,
            message: ERRORMESSAGES.MEMBERSHIP_PLAN_ALREADY_EXISTS.message,
          },
        };
      }
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: ERRORMESSAGES.MEMBERSHIP_DATABASE_ERROR.code,
          message: ERRORMESSAGES.MEMBERSHIP_DATABASE_ERROR.message,
        },
      };
    }
  }
}