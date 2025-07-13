export interface VerifyMembershipPaymentRequestDTO {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  planId: string;
}

export interface IVerifyMembershipPaymentResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  data?: { membership: any }; 
  error?: { code: string; message: string };
}