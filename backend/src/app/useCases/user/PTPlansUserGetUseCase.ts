//src/app/usecases/user/PTPlansUserGetUseCase.ts
import { IPTPlansUserGetUseCase } from './interfaces/IPTPlansUserGetUseCase';
import { IGetPTPlansResponseDTO } from '@/domain/dtos/getPTPlansResponse.dto';
import { PTPlan } from '@/domain/entities/PTPlan.entity';
import { IPTPlanRepository } from '@/app/repositories/ptPlan.repository';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { MESSAGES } from '@/domain/constants/messages.constant';
import { S3Service } from '@/infra/providers/s3.service';
import { PTPlanCategory } from '@/domain/enums/PTPlanCategory';
import { PTPlanFilter } from '@/domain/types/ptPlanFilter';
import { IUserPTPlansRequestDTO } from '@/domain/dtos/user/userPTPlanRequestDTO';

export class PTPlansUserGetUseCase implements IPTPlansUserGetUseCase {
  constructor(
    private readonly ptPlanRepository: IPTPlanRepository,
    private readonly s3Service: S3Service
  ) {}

  async execute(data: IUserPTPlansRequestDTO): Promise<IGetPTPlansResponseDTO> {
    try {
       const { page, limit, category, minPrice, maxPrice } = data;
      const skip = (page - 1) * limit;

      const filters: PTPlanFilter = {
        isActive: true,
        verifiedByAdmin: true,
        totalPrice: {
          ...(minPrice !== undefined ? { gte: minPrice } : {}),
          ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
        },
      };

      // Only include category filter if a specific category is provided
      if (category !== undefined) {
        filters.category = category as PTPlanCategory;
      }

      const [ptPlans, total] = await Promise.all([
        this.ptPlanRepository.findForUsers(filters, skip, limit),
        this.ptPlanRepository.countForUsers(filters),
      ]);
      
      // Transform PT plans to include presigned URLs for images
      const ptPlansWithUrls = await Promise.all(
        ptPlans.map(async (plan: PTPlan) => {
          const imageUrl = plan.image ? await this.s3Service.getPresignedUrl(plan.image) : null;
          const planJson = plan.toJSON();
          return { ...planJson, image: imageUrl };
        })
      );

      return {
        success: true,
        status: HttpStatus.OK,
        data: {
          plans: ptPlansWithUrls,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
        message: ptPlans.length > 0 ? MESSAGES.PTPLAN_FETCHED : MESSAGES.PTPLAN_NO_PLANS_FOUND,
      };
    } catch (error) {
      console.error('[ERROR] Get PT plans error: from PTPlansUserGetUseCase', error);
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          plans: [],
          pagination: {
            page: data.page,
            limit: data.limit,
            total: 0,
            totalPages: 0,
          },
        },
        error: {
          code: ERRORMESSAGES.GENERIC_ERROR.code,
          message: ERRORMESSAGES.GENERIC_ERROR.message,
        },
      };
    }
  }
}