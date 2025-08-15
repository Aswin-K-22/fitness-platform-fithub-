import { InitiatePTPlanPaymentRequestDTO, IInitiatePTPlanPaymentResponseDTO } from '@/domain/dtos/initiatePTPlanPayment.dto';
import { IPaymentsRepository } from '../../repositories/payments.repository';
import { IUsersRepository } from '../../repositories/users.repository';
import Razorpay from 'razorpay';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import {  MESSAGES } from '@/domain/constants/messages.constant';
import { Payment } from '@/domain/entities/Payment.entity';
import { IInitiatePTPlanPaymentUseCase } from './interfaces/IInitiatePTPlanPaymentUseCase';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { IPTPlanRepository } from '@/app/repositories/ptPlan.repository';
import { IPTPlanPurchasesRepository } from '@/app/repositories/ptPlanPurchase.repository';

export class InitiatePTPlanPaymentUseCase implements IInitiatePTPlanPaymentUseCase {
  private razorpay: Razorpay;

  constructor(
    private ptPlansRepository: IPTPlanRepository,
    private paymentsRepository: IPaymentsRepository,
    private usersRepository: IUsersRepository,
     private ptPlanPurchasesRepository: IPTPlanPurchasesRepository,
  ) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials are not configured');
    }
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  async execute(
    { planId }: InitiatePTPlanPaymentRequestDTO,
    userId: string
  ): Promise<IInitiatePTPlanPaymentResponseDTO> {
    try {
      if (!planId || !userId) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: { code: 'INVALID_INPUT', message: 'Plan ID or User ID missing' },
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

      if (!plan.totalPrice || isNaN(plan.totalPrice)) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: { code: 'INVALID_PLAN_PRICE', message: 'Plan price is invalid or missing' },
        };
      }
// Check if user already has an active PT plan (you need a repository method for this)
const activePtPlans = await this.ptPlanPurchasesRepository.findActiveByUser(userId);
const hasActivePtPlan = activePtPlans.some(p => p.ptPlanId === planId);

if (hasActivePtPlan) {
  return {
    success: false,
    status: HttpStatus.OK,
    error: ERRORMESSAGES.PTPLAN_ALREADY_ACTIVE,
  };
}


      const shortPlanId = planId.slice(-6);
      const shortUserId = userId.slice(-6);
      const receipt = `rcpt_pt_${shortPlanId}_${shortUserId}`;

      // Create Razorpay order
      const order = await this.razorpay.orders.create({
        amount: plan.totalPrice * 100, // paise
        currency: 'INR',
        receipt,
      });

      // Create Payment record in DB
      const payment = new Payment({
        type: 'pt-plan-subscription',
        userId,
        amount: plan.totalPrice,
        currency: 'INR',
        paymentGateway: 'Razorpay',
        paymentId: order.id,
        status: 'Pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await this.paymentsRepository.create(payment);

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.PAYMENT_INITIATED,
        data: {
          orderId: order.id,
          amount: plan.totalPrice,
          currency: 'INR',
        },
      };
    } catch (error: any) {
      console.error('Error in InitiatePTPlanPaymentUseCase:', error);
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: ERRORMESSAGES.GENERIC_ERROR,
      };
    }
  }
}
