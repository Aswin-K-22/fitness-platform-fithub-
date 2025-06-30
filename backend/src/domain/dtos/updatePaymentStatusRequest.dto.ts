export interface IUpdatePaymentStatusRequestDTO {
  paymentId: string;
  status: string;
  razorpayPaymentId?: string;
}