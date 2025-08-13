import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { z } from 'zod';

export interface IVerifyMembershipPaymentRequestDTO {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  planId: string;
}

export const VerifyMembershipPaymentRequest = z.object({
  razorpay_payment_id: z
    .string()
    .min(1, { message: ERRORMESSAGES.USER_INVALID_PAYMENT_ID.message }),
  razorpay_order_id: z
    .string()
    .min(1, { message: ERRORMESSAGES.USER_INVALID_ORDER_ID.message }),
  razorpay_signature: z
    .string()
    .min(1, { message: ERRORMESSAGES.USER_INVALID_PAYMENT_SIGNATURE.message }),
  planId: z
    .string()
    .min(1, { message: ERRORMESSAGES.USER_INVALID_PLAN_ID.message }),
});

export class VerifyMembershipPaymentRequestDTO implements IVerifyMembershipPaymentRequestDTO {
  public razorpay_payment_id: string;
  public razorpay_order_id: string;
  public razorpay_signature: string;
  public planId: string;

  constructor(data: unknown) {
    const parsed = VerifyMembershipPaymentRequest.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((err) => err.message).join(', ');
      throw new Error(errors);
    }
    this.razorpay_payment_id = parsed.data.razorpay_payment_id;
    this.razorpay_order_id = parsed.data.razorpay_order_id;
    this.razorpay_signature = parsed.data.razorpay_signature;
    this.planId = parsed.data.planId;
  }

  toEntity(): IVerifyMembershipPaymentRequestDTO {
    return {
      razorpay_payment_id: this.razorpay_payment_id,
      razorpay_order_id: this.razorpay_order_id,
      razorpay_signature: this.razorpay_signature,
      planId: this.planId,
    };
  }
}