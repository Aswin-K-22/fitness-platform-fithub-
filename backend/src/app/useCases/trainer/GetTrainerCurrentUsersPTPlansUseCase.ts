import { IPTPlanPurchasesRepository } from '@/app/repositories/ptPlanPurchase.repository';
import { IPTPlanRepository } from '@/app/repositories/ptPlan.repository';
import { IUsersRepository } from '@/app/repositories/users.repository';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { IGetTrainerUsersPTPlansUseCase } from './interfeces/IGetTrainerUsersPTPlansUseCase';
import { IGetTrainerUsersPTPlansResponseDTO, ITrainerUserPlanDTO, ITrainerUserWithPlansDTO } from '@/domain/dtos/trainer/IGetTrainerUsersPTPlansResponseDTO';


export class GetTrainerUsersPTPlansUseCase implements IGetTrainerUsersPTPlansUseCase {
  constructor(
    private ptPlanPurchasesRepository: IPTPlanPurchasesRepository,
    private ptPlanRepository: IPTPlanRepository,
    private usersRepository: IUsersRepository
  ) {}

  async execute(trainerId: string): Promise<IGetTrainerUsersPTPlansResponseDTO> {
    try {
      if (!trainerId) {
        return {
          success: false,
          status: HttpStatus.UNAUTHORIZED,
          error: ERRORMESSAGES.PTPLAN_UNAUTHORIZED 
            || { code: 'PTPLAN_UNAUTHORIZED', message: 'Unauthorized access' }
        };
      }

      // 1. Fetch all purchases related to trainer’s plans
      const trainerPurchases = await this.ptPlanPurchasesRepository.findByTrainerId(trainerId);

      if (!trainerPurchases || trainerPurchases.length === 0) {
        return {
          success: true,
          status: HttpStatus.OK,
          data: [],
          message: 'No users found who purchased plans from this trainer.',
        };
      }

      // 2. Group purchases by user
      const usersMap: Map<string, ITrainerUserWithPlansDTO> = new Map();

      for (const purchase of trainerPurchases) {
        // Fetch plan
        const plan = await this.ptPlanRepository.findById(purchase.ptPlanId);
        if (!plan) continue;

        // Fetch user
        const user = await this.usersRepository.findById(purchase.userId);
        if (!user) continue;

        // Build plan+purchase DTO
        const planWithPurchase: ITrainerUserPlanDTO = {
          plan: {
            id: plan.id,
            title: plan.title,
            category: plan.category,
            mode: plan.mode,
            description: plan.description,
            goal: plan.goal,
            features: plan.features,
            duration: plan.duration,
            image: plan.image,
            trainerPrice: plan.trainerPrice,
            totalPrice: plan.totalPrice,
            verifiedByAdmin: plan.verifiedByAdmin,
          },
          purchase: {
            id: purchase.id,
            status: purchase.status,
            startDate: purchase.startDate.toISOString(),
            endDate: purchase.endDate.toISOString(),
            paymentId: purchase.paymentId,
            price: purchase.price,
            currency: purchase.currency,
            paymentStatus: purchase.paymentStatus,
            paymentDate: purchase.paymentDate ? purchase.paymentDate.toISOString() : null,
            createdAt: purchase.createdAt.toISOString(),
            updatedAt: purchase.updatedAt.toISOString(),
          }
        };

        if(user.id){

        
        // Add or push into user's list
        if (!usersMap.has(user.id)) {
          usersMap.set(user.id, {
            user: {
              id: user.id,
              name: user.name,
              email: user.email.address.toString(),
              profilePic: user.profilePic,
            
            },
            plans: [planWithPurchase]
          });
        } else {
          usersMap.get(user.id)!.plans.push(planWithPurchase);
        }
    }
      }

      // 3. Convert map → array
      const usersWithPlans: ITrainerUserWithPlansDTO[] = Array.from(usersMap.values());

      return {
        success: true,
        status: HttpStatus.OK,
        data: usersWithPlans,
      };
    } catch (error) {
      console.error('Error in GetTrainerUsersPTPlansUseCase:', error);
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: ERRORMESSAGES.GENERIC_ERROR,
      };
    }
  }
}
