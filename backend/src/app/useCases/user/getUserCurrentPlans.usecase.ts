import { Membership } from "@/domain/entities/Membership.entity";
import { IGetUserCurrentPlansUseCase } from "./interfaces/IGetUserCurrentPalnsUseCase";
import { IMembershipsRepository } from "@/app/repositories/memberships.repository";
import { HttpStatus } from "@/domain/enums/httpStatus.enum";
import { IGetUserCurrentPlansResponseDTO } from "@/domain/dtos/user/getUserCurrentPlansResponse.dto";
import { ERRORMESSAGES } from "@/domain/constants/errorMessages.constant";
import { MESSAGES } from "@/domain/constants/messages.constant";

export class GetUserCurrentPlansUseCase implements IGetUserCurrentPlansUseCase {
  constructor(private membershipRepo: IMembershipsRepository) {}

  async execute(userId: string): Promise<IGetUserCurrentPlansResponseDTO> {
    if (!userId) {
      return {
        success: false,
        status: HttpStatus.UNAUTHORIZED,
        error: {
          code: ERRORMESSAGES.MEMBERSHIP_UNAUTHORIZED.code,
          message: ERRORMESSAGES.MEMBERSHIP_UNAUTHORIZED.message
        },
        data: { memberships: [] }
      };
    }

    const memberships = await this.membershipRepo.getCurrentPlansByUserId(userId);

    return {
      success: true,
      status: HttpStatus.OK,
      message: MESSAGES.MEMBERSHIP_FETCHED, // e.g., "Membership plans retrieved successfully"
      data: {
        memberships: memberships.map(m => m.toJSON())
      }
    };
  }
}