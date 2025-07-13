import { VerifyMembershipPaymentRequestDTO, IVerifyMembershipPaymentResponseDTO } from '../../domain/dtos/verifyMembershipPayment.dto';
import { IMembershipsRepository } from '../repositories/memberships.repository';
import { IPaymentsRepository } from '../repositories/payments.repository';
import { IUsersRepository } from '../repositories/users.repository';
import { IMembershipsPlanRepository } from '../repositories/membershipPlan.repository';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import crypto from 'crypto';

export class VerifyMembershipPaymentUseCase {
  constructor(
    private membershipsRepository: IMembershipsRepository,
    private paymentsRepository: IPaymentsRepository,
    private usersRepository: IUsersRepository,
    private membershipsPlanRepository: IMembershipsPlanRepository
  ) {}

  async execute(
    { razorpay_payment_id, razorpay_order_id, razorpay_signature, planId }: VerifyMembershipPaymentRequestDTO,
    userId: string
  ): Promise<IVerifyMembershipPaymentResponseDTO> {
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

      const payment = await this.paymentsRepository.findPaymentByOrderId(razorpay_order_id);
      if (!payment) {
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          error: {
            code: ERRORMESSAGES.PAYMENT_NOT_FOUND.code,
            message: ERRORMESSAGES.PAYMENT_NOT_FOUND.message,
          },
        };
      }

      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.PAYMENT_INVALID_PAYMENT_SIGNATURE.code,
            message: ERRORMESSAGES.PAYMENT_INVALID_PAYMENT_SIGNATURE.message,
          },
        };
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
        status: HttpStatus.OK,
        message: MESSAGES.PAYMENT_VERIFIED,
        data: { membership },
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