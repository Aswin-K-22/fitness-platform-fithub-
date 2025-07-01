import { PrismaClient } from '@prisma/client';
import { Payment } from '@/domain/entities/Payment.entity';
import { IPaymentsRepository } from '@/app/repositories/payments.repository';

export class PaymentsRepository implements IPaymentsRepository {
  constructor(private prisma: PrismaClient) {}

  async createPayment(data: {
    type: string;
    userId: string;
    amount: number;
    currency: string;
    paymentGateway: string;
    paymentId: string;
    status: string;
  }): Promise<Payment> {
    const payment = await this.prisma.payment.create({
      data: {
        type: data.type,
        userId: data.userId,
        amount: data.amount,
        currency: data.currency,
        paymentGateway: data.paymentGateway,
        paymentId: data.paymentId,
        status: data.status,
      },
    });
    return new Payment({
      id: payment.id,
      type: payment.type,
      userId: payment.userId,
      amount: payment.amount,
      currency: payment.currency,
      paymentGateway: payment.paymentGateway,
      paymentId: payment.paymentId,
      status: payment.status,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    });
  }

  async findPaymentByOrderId(orderId: string): Promise<Payment | null> {
    const payment = await this.prisma.payment.findFirst({
      where: { paymentId: orderId },
    });
    if (!payment) return null;
    return new Payment({
      id: payment.id,
      type: payment.type,
      userId: payment.userId,
      amount: payment.amount,
      currency: payment.currency,
      paymentGateway: payment.paymentGateway,
      paymentId: payment.paymentId,
      status: payment.status,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    });
  }

  async updatePaymentStatus(paymentId: string, status: string): Promise<Payment> {
    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status },
    });
    return new Payment({
      id: payment.id,
      type: payment.type,
      userId: payment.userId,
      amount: payment.amount,
      currency: payment.currency,
      paymentGateway: payment.paymentGateway,
      paymentId: payment.paymentId,
      status: payment.status,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    });
  }

  async updatePaymentId(paymentId: string, razorpayPaymentId: string): Promise<Payment> {
    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: { paymentId: razorpayPaymentId },
    });
    return new Payment({
      id: payment.id,
      type: payment.type,
      userId: payment.userId,
      amount: payment.amount,
      currency: payment.currency,
      paymentGateway: payment.paymentGateway,
      paymentId: payment.paymentId,
      status: payment.status,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    });
  }
}