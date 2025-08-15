import { IPTPlanPurchasesRepository } from '@/app/repositories/ptPlanPurchase.repository';
import { IPTPlanRepository } from '@/app/repositories/ptPlan.repository';
import { ITrainersRepository } from '@/app/repositories/trainers.repository';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { IGetUserCurrentPTPlansUseCase } from './interfaces/IGetUserPTPlansUseCase';
import { IGetUserPTPlansResponseDTO, IUserPTPlanResponseDTO } from '@/domain/dtos/user/IUserPTPlanResponseDTO';

export class GetUserCurrentPTPlansUseCase implements IGetUserCurrentPTPlansUseCase {
  constructor(
    private ptPlanPurchasesRepository: IPTPlanPurchasesRepository,
    private ptPlanRepository: IPTPlanRepository,
    private trainersRepository: ITrainersRepository
  ) {}

  async execute(userId: string): Promise<IGetUserPTPlansResponseDTO> {
    try {
      if (!userId) {
        return {
          success: false,
          status: HttpStatus.UNAUTHORIZED,
          error: ERRORMESSAGES.PTPLAN_UNAUTHORIZED || { code: 'PTPLAN_UNAUTHORIZED', message: 'Unauthorized access' }
        };
      }

      // Get all PT plan purchases for the user
    const activePurchases = await this.ptPlanPurchasesRepository.findActiveByUser(userId);

      if (!activePurchases || activePurchases.length === 0) {
        return {
          success: true,
          status: HttpStatus.OK,
          data: [],
          message: 'No active personal trainer plans found for this user.',
        };
      }

      // For each purchase, fetch plan and trainer details
      const userPTPlans: IUserPTPlanResponseDTO[] = [];

      for (const purchase of activePurchases) {
        // Fetch PTPlan entity
        const plan = await this.ptPlanRepository.findById(purchase.ptPlanId);
        if (!plan) {
          // Skip if plan not found (or handle as needed)
          continue;
        }

        // Fetch Trainer entity
        const trainer = await this.trainersRepository.findById(plan.createdBy);
        if (!trainer) {
          // Skip if trainer not found (or handle as needed)
          continue;
        }

        // Compose DTO with selected fields from each entity
        userPTPlans.push({
          trainer: {
            id: trainer.id,
            name: trainer.name,
            profilePic: trainer.profilePic,
            specialties: trainer.specialties,
            experienceLevel: trainer.experienceLevel,
            bio: trainer.bio,
          },
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
        });
      }

      return {
        success: true,
        status: HttpStatus.OK,
        data: userPTPlans,
      };
    } catch (error) {
      console.error('Error in GetUserPTPlansUseCase:', error);
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: ERRORMESSAGES.GENERIC_ERROR,
      };
    }
  }
}
