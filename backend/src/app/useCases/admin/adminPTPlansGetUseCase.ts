// src/app/useCases/admin/adminPTPlansGetUseCase.ts
import { IAdminPTPlansRequestDTO } from '@/domain/dtos/adminPTPlansRequestDTO';
import { IGetPTPlansResponseDTO } from '@/domain/dtos/getPTPlansResponse.dto';
import { PTPlan } from '@/domain/entities/PTPlan.entity';
import { IPTPlanRepository } from '@/app/repositories/ptPlan.repository';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { MESSAGES } from '@/domain/constants/messages.constant';
import { S3Service } from '@/infra/providers/s3.service';
import { IAdminPTPlansGetUseCase } from './interfeces/IAdminPTPlansGetUseCase';

export class AdminPTPlansGetUseCase implements IAdminPTPlansGetUseCase {
  constructor(
    private readonly ptPlanRepository: IPTPlanRepository,
    private readonly s3Service: S3Service
  ) {}

  async execute(data: IAdminPTPlansRequestDTO): Promise<IGetPTPlansResponseDTO> {
    try {
      const { page, limit, verifiedByAdmin } = data;
      const skip = (page - 1) * limit;

    const [ptPlans, total] = await Promise.all([
        this.ptPlanRepository.findAllByAdminVerification(skip, limit, verifiedByAdmin),
        this.ptPlanRepository.countByAdminVerification(verifiedByAdmin),
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
      console.error('[ERROR] Get Trainer PT plans error:', error);
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