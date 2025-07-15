// backend/src/app/repositories/payments.repository.ts
import { IBaseRepository } from './base.repository';
import { Payment } from '@/domain/entities/Payment.entity';

export interface IPaymentsRepository extends IBaseRepository<Payment> {
  findPaymentByOrderId(orderId: string): Promise<Payment | null>;
  updatePaymentStatus(paymentId: string, status: string): Promise<Payment>;
  updatePaymentId(paymentId: string, razorpayPaymentId: string): Promise<Payment>;
}