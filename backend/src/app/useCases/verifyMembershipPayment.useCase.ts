import { VerifyMembershipPaymentRequestDTO, VerifyMembershipPaymentResponseDTO } from '@/domain/dtos/verifyMembershipPayment.dto';
import { IMembershipsRepository } from '@/app/repositories/memberships.repository';
import { IPaymentsRepository } from '@/app/repositories/payments.repository';
import { IUsersRepository } from '@/app/repositories/users.repository';
import { PaymentErrorType } from '@/domain/enums/paymentErrorType.enum';
import crypto from 'crypto';
import { IMembershipsPlanRepository } from '../repositories/membershipPlan.repository';

export class VerifyMembershipPaymentUseCase {
  constructor(
    private membershipsRepository: IMembershipsRepository,
    private paymentsRepository: IPaymentsRepository,
    private usersRepository: IUsersRepository,
    private membershipsPlanRepository: IMembershipsPlanRepository
  ) {}

  async execute({
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    planId,
  }: VerifyMembershipPaymentRequestDTO, userId: string): Promise<VerifyMembershipPaymentResponseDTO> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new Error(PaymentErrorType.UserNotFound);
    }

    const plan = await this.membershipsPlanRepository.findPlanById(planId);
    if (!plan) {
      throw new Error(PaymentErrorType.PlanNotFound);
    }

    const payment = await this.paymentsRepository.findPaymentByOrderId(razorpay_order_id);
    if (!payment) {
      throw new Error(PaymentErrorType.PaymentNotFound);
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      throw new Error(PaymentErrorType.InvalidPaymentSignature);
    }

    await this.paymentsRepository.updatePaymentStatus(payment.id!, 'Paid');
    await this.paymentsRepository.updatePaymentId(payment.id!, razorpay_payment_id);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.duration);

    const membership = await this.membershipsRepository.createMembership({
      userId,
      planId,
      status: 'Active',
      startDate,
      endDate,
      paymentId: payment.id!,
      price: plan.price,
      currency: 'INR',
      paymentStatus: 'Paid',
      paymentDate: new Date(),
    });

    await this.usersRepository.updateMembership(userId, membership.id!);

    return {
      success: true,
      message: 'Payment verified and subscription activated',
    };
  }
}