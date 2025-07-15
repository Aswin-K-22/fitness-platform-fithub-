// backend/src/infra/repositories/payment.repository.ts
import { PrismaClient } from '@prisma/client';
import { Payment } from '@/domain/entities/Payment.entity';
import { IPaymentsRepository } from '@/app/repositories/payments.repository';
import { BaseRepository } from './base.repository';

export class PaymentsRepository
  extends BaseRepository<Payment>
  implements IPaymentsRepository
{
  constructor(prisma: PrismaClient) {
    super(prisma, 'payment');
  }

  protected toDomain(record: any): Payment {
    return new Payment({
      id: record.id,
      type: record.type,
      userId: record.userId,
      amount: record.amount,
      currency: record.currency,
      paymentGateway: record.paymentGateway,
      paymentId: record.paymentId,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async findPaymentByOrderId(orderId: string): Promise<Payment | null> {
    const payment = await this.prisma.payment.findFirst({ where: { paymentId: orderId } });
    return payment ? this.toDomain(payment) : null;
  }

  async updatePaymentStatus(paymentId: string, status: string): Promise<Payment> {
    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status },
    });
    return this.toDomain(payment);
  }

  async updatePaymentId(paymentId: string, razorpayPaymentId: string): Promise<Payment> {
    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: { paymentId: razorpayPaymentId },
    });
    return this.toDomain(payment);
  }
}