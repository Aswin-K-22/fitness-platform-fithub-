export interface ICreatePaymentRequestDTO {
  type: string;
  userId?: string;
  amount: number;
  currency: string;
  paymentGateway?: string;
  paymentId?: string;
  status: string;
}