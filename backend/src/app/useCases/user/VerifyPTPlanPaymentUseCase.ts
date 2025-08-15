import { VerifyPTPlanPaymentRequestDTO, IVerifyPTPlanPaymentResponseDTO } from '@/domain/dtos/verifyPTPlanPayment.dto';
import { IPaymentsRepository } from '../../repositories/payments.repository';
import { IUsersRepository } from '../../repositories/users.repository';
import crypto from 'crypto';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { MESSAGES } from '@/domain/constants/messages.constant';
import { IVerifyPTPlanPaymentUseCase } from './interfaces/IVerifyPTPlanPaymentUseCase';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { IPTPlanRepository } from '@/app/repositories/ptPlan.repository';
import { IPTPlanPurchasesRepository } from '@/app/repositories/ptPlanPurchase.repository';
import { PTPlanPurchase } from '@/domain/entities/PTPlanPurchase.entity';
import { PTPlanPurchaseStatus } from '@/domain/enums/PTPlanPurchaseStatus';
import { Notification } from '@/domain/entities/Notification.entity';
import { NotificationService } from '@/infra/providers/notification.service';

export class VerifyPTPlanPaymentUseCase implements IVerifyPTPlanPaymentUseCase {
  constructor(
    private ptPlansRepository: IPTPlanRepository,
    private paymentsRepository: IPaymentsRepository,
    private usersRepository: IUsersRepository,
    private ptPlanPurchasesRepository: IPTPlanPurchasesRepository,
    private notificationService: NotificationService 
  ) {}

  async execute(
    { razorpay_payment_id, razorpay_order_id, razorpay_signature, planId }: VerifyPTPlanPaymentRequestDTO,
    userId: string
  ): Promise<IVerifyPTPlanPaymentResponseDTO> {
    try {
      if (!userId) {
        return {
          success: false,
          status: HttpStatus.UNAUTHORIZED,
          error: ERRORMESSAGES.PAYMENT_USER_UNAUTHORIZED,
        };
      }

      const user = await this.usersRepository.findById(userId);
      if (!user) {
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          error: ERRORMESSAGES.PAYMENT_USER_NOT_FOUND,
        };
      }

      const plan = await this.ptPlansRepository.findById(planId);
      if (!plan) {
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          error: ERRORMESSAGES.PAYMENT_PLAN_NOT_FOUND,
        };
      }

      const activePurchases = await this.ptPlanPurchasesRepository.findActiveByUser(userId);
      const alreadyHasPlan = activePurchases.some(p => p.ptPlanId === planId);
      if (alreadyHasPlan) {
        return {
          success: false,
          status: HttpStatus.OK,
          error: {
            code: 'PTPLAN_ALREADY_ACTIVE',
            message: 'You already have an active PT plan for this plan',
          },
        };
      }

      const payment = await this.paymentsRepository.findPaymentByOrderId(razorpay_order_id);
      if (!payment) {
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          error: ERRORMESSAGES.PAYMENT_NOT_FOUND,
        };
      }

      if (!process.env.RAZORPAY_KEY_SECRET) {
        return {
          success: false,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: { code: 'CONFIG_ERROR', message: 'Razorpay key secret not configured' },
        };
      }

      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: ERRORMESSAGES.PAYMENT_INVALID_PAYMENT_SIGNATURE,
        };
      }

      if (!payment.id) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: { code: "INVALID_PAYMENT_ID", message: "Missing Razorpay payment ID" },
        };
      }

      await this.paymentsRepository.updatePaymentStatus(payment.id, 'Paid');
      await this.paymentsRepository.updatePaymentId(payment.id, razorpay_payment_id);

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + plan.duration);

      const ptPlanPurchase = await this.ptPlanPurchasesRepository.create(
        new PTPlanPurchase({
          userId,
          ptPlanId: planId,
          status: PTPlanPurchaseStatus.Active,
          startDate,
          endDate,
          paymentId: payment.id,
          price: plan.totalPrice,
          currency: 'INR',
          paymentStatus: 'Paid',
          paymentDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      );

      await this.paymentsRepository.update(payment.id, {
        ptPlanPurchaseId: ptPlanPurchase.id,
        status: 'Paid',
        paymentId: razorpay_payment_id
      });

      // ✅ Add Real-Time Notification
      const notification = new Notification({
        userId,
        message: `Your purchase of "${plan.title}" PT plan is successful!`,
        type: 'success',
        createdAt: new Date(),
        read: false
      });
      await this.notificationService.sendNotification(notification);

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.PAYMENT_VERIFIED,
        data: { ptPlanPurchase },
      };
    } catch (error) {
      console.error('Error in VerifyPTPlanPaymentUseCase:', error);
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: ERRORMESSAGES.GENERIC_ERROR,
      };
    }
  }
}
