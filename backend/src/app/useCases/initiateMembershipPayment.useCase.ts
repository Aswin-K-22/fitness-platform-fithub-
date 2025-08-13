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
import { IInitiateMembershipPaymentUseCase } from './user/interfaces/IInitiateMembershipPaymentUseCase';

export class InitiateMembershipPaymentUseCase implements IInitiateMembershipPaymentUseCase {
  private razorpay: Razorpay;

  constructor(
    private membershipsRepository: IMembershipsRepository,
    private paymentsRepository: IPaymentsRepository,
    private usersRepository: IUsersRepository,
    private membershipsPlanRepository: IMembershipsPlanRepository
  ) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials missing', {
        keyId: process.env.RAZORPAY_KEY_ID,
        keySecret: process.env.RAZORPAY_KEY_SECRET ? '****' : undefined,
      });
      throw new Error('Razorpay key ID or secret is not configured');
    }
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  async execute(
    { planId }: InitiateMembershipPaymentRequestDTO,
    userId: string
  ): Promise<IInitiateMembershipPaymentResponseDTO> {
    console.log('InitiateMembershipPaymentUseCase started', { planId, userId });

    try {
      // Validate inputs
      if (!planId || !userId) {
        console.error('Invalid input', { planId, userId });
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: 'INVALID_INPUT',
            message: 'planId or userId is missing',
          },
        };
      }

      // Fetch user
      console.log('Fetching user with ID:', userId);
      const user = await this.usersRepository.findById(userId);
  //  console.log('User fetch result:', user);
      if (!user) {
        console.error('User not found', { userId });
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          error: {
            code: ERRORMESSAGES.PAYMENT_USER_NOT_FOUND.code,
            message: ERRORMESSAGES.PAYMENT_USER_NOT_FOUND.message,
          },
        };
      }

      // Fetch plan
      console.log('Fetching plan with ID:', planId);
      const plan = await this.membershipsPlanRepository.findById(planId);
   // console.log('Plan fetch result:', plan);
      if (!plan) {
        console.error('Plan not found', { planId });
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          error: {
            code: ERRORMESSAGES.PAYMENT_PLAN_NOT_FOUND.code,
            message: ERRORMESSAGES.PAYMENT_PLAN_NOT_FOUND.message,
          },
        };
      }







      // Validate plan price
      if (!plan.price || isNaN(plan.price)) {
        console.error('Invalid plan price', { planId, price: plan.price });
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: 'INVALID_PLAN_PRICE',
            message: 'Plan price is invalid or missing',
          },
        };
      }


    const activeMemberships = await this.membershipsRepository.getCurrentPlansByUserId(userId);

const alreadyHasPlan = activeMemberships.some(m => m.planId === planId);
if (alreadyHasPlan) {
  return {
    success: false,
    status: HttpStatus.OK,
    error: {
      code: 'MEMBERSHIP_ALREADY_ACTIVE',
      message: 'You already have an active membership for this plan'
    }
  };
}




      // Generate receipt
      const shortPlanId = planId.slice(-6);
      const shortUserId = userId.slice(-6);
      const receipt = `rcpt_${shortPlanId}_${shortUserId}`;
      console.log('Generated receipt:', receipt);

      // Create Razorpay order
      let order;
      try {
        console.log('Creating Razorpay order', { amount: plan.price * 100, currency: 'INR', receipt });
        order = await this.razorpay.orders.create({
          amount: plan.price * 100, // Convert to paise
          currency: 'INR',
          receipt,
        });
        console.log('Razorpay order created:', order);
      } catch (error: any) {
        console.error('Razorpay order creation failed', {
          message: error.message,
          status: error.status,
          code: error.error?.code,
          description: error.error?.description,
        });
        return {
          success: false,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: {
            code: ERRORMESSAGES.PAYMENT_INITIATION_FAILED.code,
            message: ERRORMESSAGES.PAYMENT_INITIATION_FAILED.message,
          },
        };
      }

      // Create payment record
      const payment = new Payment({
        type: 'subscription',
        userId,
           membershipPlanId: planId ,
        amount: plan.price,
        currency: 'INR',
        paymentGateway: 'Razorpay',
        paymentId: order.id,
        status: 'Pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      
      });
      console.log('Creating payment record', { payment: payment.toJSON() });

      try {
        const savedPayment = await this.paymentsRepository.create(payment);
        console.log('Payment record created:', savedPayment);
      } catch (error: any) {
        console.error('Payment creation failed', {
          message: error.message,
          stack: error.stack,
          payment: payment.toJSON(),
        });
        throw error; // Re-throw to be caught by outer try-catch
      }

      // Return success response
      console.log('Payment initiated successfully', { orderId: order.id });
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
    } catch (error: any) {
      console.error('Unexpected error in InitiateMembershipPaymentUseCase', {
        message: error.message,
        stack: error.stack,
      });
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