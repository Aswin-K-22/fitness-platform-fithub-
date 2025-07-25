// src/domain/dtos/updateAdminPriceRequestDTO.ts
import { z } from 'zod';
import { ERRORMESSAGES } from '../constants/errorMessages.constant';

export interface IUpdateAdminPriceRequestDTO {
  planId: string;
  adminPrice: number;
}

export const UpdateAdminPriceRequest = z.object({
  planId: z.string().min(1, { message: ERRORMESSAGES.PTPLAN_INVALID_ID.message }),
  adminPrice: z
    .number()
    .min(0, { message: ERRORMESSAGES.PTPLAN_INVALID_TRAINER_PRICE.message })
    .refine((val) => Number.isFinite(val), { message: ERRORMESSAGES.PTPLAN_INVALID_TRAINER_PRICE.message }),
});

export class UpdateAdminPriceRequestDTO implements IUpdateAdminPriceRequestDTO {
  public planId: string;
  public adminPrice: number;

  constructor(data: unknown) {
    const parsed = UpdateAdminPriceRequest.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((err) => err.message).join(', ');
      throw new Error(errors);
    }
    this.planId = parsed.data.planId;
    this.adminPrice = parsed.data.adminPrice;
  }

  toEntity(): IUpdateAdminPriceRequestDTO {
    return {
      planId: this.planId,
      adminPrice: this.adminPrice,
    };
  }
}