import { Payment } from '@/domain/entities/Payment.entity';

export interface IPaymentsRepository {
  createPayment(data: {
    type: string;
    userId: string;
    amount: number;
    currency: string;
    paymentGateway: string;
    paymentId: string;
    status: string;
  }): Promise<Payment>;
  findPaymentByOrderId(orderId: string): Promise<Payment | null>;
  updatePaymentStatus(paymentId: string, status: string): Promise<Payment>;
  updatePaymentId(paymentId: string, razorpayPaymentId: string): Promise<Payment>;
}