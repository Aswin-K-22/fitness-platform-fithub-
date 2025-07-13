import { InitiateMembershipPaymentRequestDTO, IInitiateMembershipPaymentResponseDTO } from '../../domain/dtos/initiateMembershipPayment.dto';
import { Payment } from '../../domain/entities/Payment.entity';
import { IMembershipsRepository } from '../repositories/memberships.repository';
import { IPaymentsRepository } from '../repositories/payments.repository';
import { IUsersRepository } from '../repositories/users.repository';
import { IMembershipsPlanRepository } from '../repositories/membershipPlan.repository';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import Razorpay from 'razorpay';

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
  ): Promise<IInitiateMembershipPaymentResponseDTO> {
    try {
      const user = await this.usersRepository.findById(userId);
      if (!user) {
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          error: {
            code: ERRORMESSAGES.PAYMENT_USER_NOT_FOUND.code,
            message: ERRORMESSAGES.PAYMENT_USER_NOT_FOUND.message,
          },
        };
      }

      const plan = await this.membershipsPlanRepository.findPlanById(planId);
      if (!plan) {
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          error: {
            code: ERRORMESSAGES.PAYMENT_PLAN_NOT_FOUND.code,
            message: ERRORMESSAGES.PAYMENT_PLAN_NOT_FOUND.message,
          },
        };
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
        return {
          success: false,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: {
            code: ERRORMESSAGES.PAYMENT_INITIATION_FAILED.code,
            message: ERRORMESSAGES.PAYMENT_INITIATION_FAILED.message,
          },
        };
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
        status: HttpStatus.OK,
        message: MESSAGES.PAYMENT_INITIATED,
        data: {
          orderId: order.id,
          amount: plan.price,
          currency: 'INR',
        },
      };
    } catch (error) {
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: ERRORMESSAGES.GENERIC_ERROR.code,
          message: ERRORMESSAGES.GENERIC_ERROR.message,
        },
      };
    }
  }
}