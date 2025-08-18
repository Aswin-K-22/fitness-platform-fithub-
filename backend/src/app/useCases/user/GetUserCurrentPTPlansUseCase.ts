import { IPTPlanPurchasesRepository } from '@/app/repositories/ptPlanPurchase.repository';
import { IPTPlanRepository } from '@/app/repositories/ptPlan.repository';
import { ITrainersRepository } from '@/app/repositories/trainers.repository';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { IGetUserCurrentPTPlansUseCase } from './interfaces/IGetUserPTPlansUseCase';
import { 
  IGetUserPTPlansResponseDTO, 
  IUserTrainerWithPlansDTO, 
  IUserPlanWithPurchaseDTO 
} from '@/domain/dtos/user/IUserPTPlanResponseDTO';
import { S3Service } from '@/infra/providers/s3.service';


export class GetUserCurrentPTPlansUseCase implements IGetUserCurrentPTPlansUseCase {
  constructor(
    private ptPlanPurchasesRepository: IPTPlanPurchasesRepository,
    private ptPlanRepository: IPTPlanRepository,
    private trainersRepository: ITrainersRepository,
     private s3Service: S3Service
  ) {}

  async execute(userId: string): Promise<IGetUserPTPlansResponseDTO> {
    try {
      if (!userId) {
        return {
          success: false,
          status: HttpStatus.UNAUTHORIZED,
          error: ERRORMESSAGES.PTPLAN_UNAUTHORIZED 
            || { code: 'PTPLAN_UNAUTHORIZED', message: 'Unauthorized access' }
        };
      }

      // 1. Get all active purchases for the user
      const activePurchases = await this.ptPlanPurchasesRepository.findActiveByUser(userId);

      if (!activePurchases || activePurchases.length === 0) {
        return {
          success: true,
          status: HttpStatus.OK,
          data: [],
          message: 'No active personal trainer plans found for this user.',
        };
      }

      // 2. Group by trainer
      const trainerMap: Map<string, IUserTrainerWithPlansDTO> = new Map();

      for (const purchase of activePurchases) {
        // Fetch plan
        const plan = await this.ptPlanRepository.findById(purchase.ptPlanId);
        if (!plan) continue;

        // Fetch trainer

        if (!plan.createdBy) {
  continue; // or handle error
}

        const trainer = await this.trainersRepository.findById(plan.createdBy);
        if (!trainer) continue;

        // Build plan+purchase DTO
        const imageUrl = plan.image ? await this.s3Service.getPresignedUrl(plan.image) : null;

        const planWithPurchase: IUserPlanWithPurchaseDTO = {
          plan: {
            id: plan.id,
            title: plan.title,
            category: plan.category,
            mode: plan.mode,
            description: plan.description,
            goal: plan.goal,
            features: plan.features,
            duration: plan.duration,
            image:imageUrl,
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

        // Add trainer & plans grouping
        if (!trainer.id) {
  continue;
}

let profilePicUrl = trainer.profilePic;
if (profilePicUrl && profilePicUrl.startsWith('trainer-profiles/')) {
  profilePicUrl = await this.s3Service.getPresignedUrl(profilePicUrl) || trainer.profilePic;
}



        if (!trainerMap.has(trainer.id)) {
          trainerMap.set(trainer.id, {
            trainer: {
              id: trainer.id,
              name: trainer.name,
              profilePic:  profilePicUrl,
              specialties: trainer.specialties,
              experienceLevel: trainer.experienceLevel,
              bio: trainer.bio,
            },
            plans: [planWithPurchase]
          });
        } else {
          trainerMap.get(trainer.id)!.plans.push(planWithPurchase);
        }
      }

      // 3. Convert grouping → array
      const trainersWithPlans: IUserTrainerWithPlansDTO[] = Array.from(trainerMap.values());

      return {
        success: true,
        status: HttpStatus.OK,
        data: trainersWithPlans,
      };
    } catch (error) {
      console.error('Error in GetUserCurrentPTPlansUseCase:', error);
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: ERRORMESSAGES.GENERIC_ERROR,
      };
    }
  }
}
