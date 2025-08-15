// src/domain/dtos/verifyPTPlanPayment.dto.ts
export interface VerifyPTPlanPaymentRequestDTO {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  planId: string;
}

export interface IVerifyPTPlanPaymentResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  data?: {
    ptPlanPurchase: any;  // Use PTPlanPurchase type instead of 'any' if available
  };
  error?: {
    code: string;
    message: string;
  };
}

