// src/domain/dtos/verifyPTPlanRequestDTO.ts
import { z } from 'zod';
import { ERRORMESSAGES } from '../constants/errorMessages.constant';

export interface IVerifyPTPlanRequestDTO {
  planId: string;
  verifiedByAdmin: boolean;
}

export const VerifyPTPlanRequest = z.object({
  planId: z.string().min(1, { message: ERRORMESSAGES.PTPLAN_INVALID_ID.message }),
  verifiedByAdmin: z.literal(true, { message: ERRORMESSAGES.PTPLAN_INVALID_VERIFICATION_STATUS.message }),
});

export class VerifyPTPlanRequestDTO implements IVerifyPTPlanRequestDTO {
  public planId: string;
  public verifiedByAdmin: boolean;

  constructor(data: unknown) {
    const parsed = VerifyPTPlanRequest.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((err) => err.message).join(', ');
      throw new Error(errors);
    }
    this.planId = parsed.data.planId;
    this.verifiedByAdmin = parsed.data.verifiedByAdmin;
  }

  toEntity(): IVerifyPTPlanRequestDTO {
    return {
      planId: this.planId,
      verifiedByAdmin: this.verifiedByAdmin,
    };
  }
}

