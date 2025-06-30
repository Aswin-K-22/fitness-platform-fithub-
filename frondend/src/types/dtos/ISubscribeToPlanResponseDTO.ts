// ISubscribeToPlanResponseDTO.ts
export interface ISubscribeToPlanResponseDTO {
    orderId: string;
    amount: number;
    currency: string;
  }
  
  // IVerifyPaymentRequestDTO.ts
  export interface IVerifyPaymentRequestDTO {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    planId: string;
  }