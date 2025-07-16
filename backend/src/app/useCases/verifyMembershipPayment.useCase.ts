import { VerifyMembershipPaymentRequestDTO, IVerifyMembershipPaymentResponseDTO } from '../../domain/dtos/verifyMembershipPayment.dto';
import { IMembershipsRepository } from '../repositories/memberships.repository';
import { IPaymentsRepository } from '../repositories/payments.repository';
import { IUsersRepository } from '../repositories/users.repository';
import { IMembershipsPlanRepository } from '../repositories/membershipPlan.repository';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import crypto from 'crypto';
import { Membership } from '@/domain/entities/Membership.entity';
import { IVerifyMembershipPaymentUseCase } from './interfaces/IVerifyMembershipPaymentUseCase';
import { NotificationService } from '@/infra/providers/notification.service';
import { Notification } from '@/domain/entities/Notification.entity';

const logError = (context: string, error: unknown) => {
  console.error(`[VerifyMembershipPaymentUseCase] ${context}:`, {
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
  });
};

export class VerifyMembershipPaymentUseCase implements IVerifyMembershipPaymentUseCase {
  constructor(
    private membershipsRepository: IMembershipsRepository,
    private paymentsRepository: IPaymentsRepository,
    private usersRepository: IUsersRepository,
    private membershipsPlanRepository: IMembershipsPlanRepository,
    private notificationService: NotificationService
  ) {}

  async execute(
    { razorpay_payment_id, razorpay_order_id, razorpay_signature, planId }: VerifyMembershipPaymentRequestDTO,
    userId: string
  ): Promise<IVerifyMembershipPaymentResponseDTO> {
    try {
      console.log('[VerifyMembershipPaymentUseCase] Input:', {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        planId,
        userId,
      });

      console.log('[VerifyMembershipPaymentUseCase] Finding user by ID:', userId);
      const user = await this.usersRepository.findById(userId);
      if (!user) {
        logError('User not found', new Error(`User ID: ${userId}`));
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          error: {
            code: ERRORMESSAGES.PAYMENT_USER_NOT_FOUND.code,
            message: ERRORMESSAGES.PAYMENT_USER_NOT_FOUND.message,
          },
        };
      }
      console.log('[VerifyMembershipPaymentUseCase] User found:', user);

      console.log('[VerifyMembershipPaymentUseCase] Finding plan by ID:', planId);
      const plan = await this.membershipsPlanRepository.findById(planId);
      if (!plan) {
        logError('Plan not found', new Error(`Plan ID: ${planId}`));
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          error: {
            code: ERRORMESSAGES.PAYMENT_PLAN_NOT_FOUND.code,
            message: ERRORMESSAGES.PAYMENT_PLAN_NOT_FOUND.message,
          },
        };
      }
      console.log('[VerifyMembershipPaymentUseCase] Plan found:', plan);

      console.log('[VerifyMembershipPaymentUseCase] Finding payment by order ID:', razorpay_order_id);
      const payment = await this.paymentsRepository.findPaymentByOrderId(razorpay_order_id);
      if (!payment) {
        logError('Payment not found', new Error(`Order ID: ${razorpay_order_id}`));
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          error: {
            code: ERRORMESSAGES.PAYMENT_NOT_FOUND.code,
            message: ERRORMESSAGES.PAYMENT_NOT_FOUND.message,
          },
        };
      }
      console.log('[VerifyMembershipPaymentUseCase] Payment found:', payment);

      console.log('[VerifyMembershipPaymentUseCase] Generating signature');
      if (!process.env.RAZORPAY_KEY_SECRET) {
        logError('Razorpay key secret missing', new Error('Environment variable RAZORPAY_KEY_SECRET not set'));
        return {
          success: false,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: {
            code: ERRORMESSAGES.GENERIC_ERROR.code,
            message: 'Razorpay key secret not configured',
          },
        };
      }

      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      console.log('[VerifyMembershipPaymentUseCase] Signature comparison:', {
        generatedSignature,
        razorpay_signature,
      });

      if (generatedSignature !== razorpay_signature) {
        logError('Invalid signature', new Error('Signature mismatch'));
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.PAYMENT_INVALID_PAYMENT_SIGNATURE.code,
            message: ERRORMESSAGES.PAYMENT_INVALID_PAYMENT_SIGNATURE.message,
          },
        };
      }

      console.log('[VerifyMembershipPaymentUseCase] Updating payment status for ID:', payment.id);
      if (!payment.id) {
        logError('Payment ID missing', new Error(`Payment ID is undefined for order ID: ${razorpay_order_id}`));
        return {
          success: false,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: {
            code: ERRORMESSAGES.GENERIC_ERROR.code,
            message: 'Payment ID is missing',
          },
        };
      }

      await this.paymentsRepository.updatePaymentStatus(payment.id, 'Paid');
      console.log('[VerifyMembershipPaymentUseCase] Payment status updated to Paid');

      await this.paymentsRepository.updatePaymentId(payment.id, razorpay_payment_id);
      console.log('[VerifyMembershipPaymentUseCase] Payment ID updated');

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + plan.duration);
      console.log('[VerifyMembershipPaymentUseCase] Creating membership with:', {
        userId,
        planId,
        startDate,
        endDate,
        paymentId: payment.id,
        price: plan.price,
        currency: 'INR',
      });

      const membership = await this.membershipsRepository.create(
        new Membership({
          userId,
          planId,
          status: 'Active',
          startDate,
          endDate,
          paymentId: payment.id,
          price: plan.price,
          currency: 'INR',
          paymentStatus: 'Paid',
          paymentDate: new Date(),
        }).toJSON()
      );
      console.log('[VerifyMembershipPaymentUseCase] Membership created:', membership);

      const notification = new Notification({
        userId,
        message: `Your purchase of ${plan.name} membership is successful!`,
        type: 'success',
        createdAt: new Date(),
        read: false,
      });
      await this.notificationService.sendNotification(notification);
      console.log('[VerifyMembershipPaymentUseCase] Notification sent:', notification.toJSON());

      console.log('[VerifyMembershipPaymentUseCase] Updating user membership for user ID:', userId);
      if (!membership.id) {
        logError('Membership ID missing', new Error('Membership ID is undefined after creation'));
        return {
          success: false,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: {
            code: ERRORMESSAGES.GENERIC_ERROR.code,
            message: 'Membership ID is missing',
          },
        };
      }

      await this.usersRepository.updateMembership(userId, membership.id);
      console.log('[VerifyMembershipPaymentUseCase] User membership updated');

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.PAYMENT_VERIFIED,
        data: { membership },
      };
    } catch (error) {
      logError('Unexpected error in execute', error);
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