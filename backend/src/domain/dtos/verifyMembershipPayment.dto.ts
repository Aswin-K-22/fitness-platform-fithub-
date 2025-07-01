export interface VerifyMembershipPaymentRequestDTO {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  planId: string;
}

export interface VerifyMembershipPaymentResponseDTO {
  success: boolean;
  message?: string;
}