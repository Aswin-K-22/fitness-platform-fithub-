import { InitiateMembershipPaymentRequestDTO, InitiateMembershipPaymentResponseDTO } from '@/domain/dtos/initiateMembershipPayment.dto';
import { Payment } from '@/domain/entities/Payment.entity';
import { IMembershipsRepository } from '@/app/repositories/memberships.repository';
import { IPaymentsRepository } from '@/app/repositories/payments.repository';
import { IUsersRepository } from '@/app/repositories/users.repository';
import { PaymentErrorType } from '@/domain/enums/paymentErrorType.enum';
import Razorpay from 'razorpay';
import { IMembershipsPlanRepository } from '../repositories/membershipPlan.repository';

export class InitiateMembershipPaymentUseCase {
  private razorpay: Razorpay;

  constructor(
    private membershipsRepository: IMembershipsRepository,
    private paymentsRepository: IPaymentsRepository,
    private usersRepository: IUsersRepository,
    private membershipsPlanRepository: IMembershipsPlanRepository
  ) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });
  }

  async execute(
    { planId }: InitiateMembershipPaymentRequestDTO,
    userId: string
  ): Promise<InitiateMembershipPaymentResponseDTO> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new Error(PaymentErrorType.UserNotFound);
    }

    const plan = await this.membershipsPlanRepository.findPlanById(planId);
    if (!plan) {
      throw new Error(PaymentErrorType.PlanNotFound);
    }

    const shortPlanId = planId.slice(-6);
    const shortUserId = userId.slice(-6);
    const receipt = `rcpt_${shortPlanId}_${shortUserId}`;

    let order;
    try {
      order = await this.razorpay.orders.create({
        amount: plan.price * 100, // Convert to paise
        currency: 'INR',
        receipt,
      });
    } catch (error) {
      throw new Error(PaymentErrorType.PaymentInitiationFailed);
    }

    const payment = await this.paymentsRepository.createPayment({
      type: 'subscription',
      userId,
      amount: plan.price,
      currency: 'INR',
      paymentGateway: 'Razorpay',
      paymentId: order.id,
      status: 'Pending',
    });

    return {
      success: true,
      orderId: order.id,
      amount: plan.price,
      currency: 'INR',
    };
  }
}