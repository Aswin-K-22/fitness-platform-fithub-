import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { z } from 'zod';

export interface IInitiateMembershipPaymentRequestDTO {
  planId: string;
}

export const InitiateMembershipPaymentRequest = z.object({
  planId: z
    .string()
    .min(1, { message: ERRORMESSAGES.USER_INVALID_PLAN_ID.message }),
});

export class InitiateMembershipPaymentRequestDTO implements IInitiateMembershipPaymentRequestDTO {
  public planId: string;

  constructor(data: unknown) {
    const parsed = InitiateMembershipPaymentRequest.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((err) => err.message).join(', ');
      throw new Error(errors);
    }
    this.planId = parsed.data.planId;
  }

  toEntity(): IInitiateMembershipPaymentRequestDTO {
    return {
      planId: this.planId,
    };
  }
}