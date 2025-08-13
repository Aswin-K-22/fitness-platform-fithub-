
//src/app/useCases/trainer/editPTPlan.useCase.ts
import { IEditPTPlanRequestToEntity } from '@/domain/dtos/editPTPlanRequest.dto';
import { IResponseDTO } from '@/domain/dtos/response.dto';
import { PTPlan } from '@/domain/entities/PTPlan.entity';
import { IPTPlanRepository } from '@/app/repositories/ptPlan.repository';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { MESSAGES } from '@/domain/constants/messages.constant';
import { IEditPTPlanUseCase } from './interfeces/IEditPTPlanUseCase';
import { S3Service } from '@/infra/providers/s3.service';
import { IPTPlanRequestToEntity } from '@/domain/dtos/createPTPlanRequest.dto';



export class EditPTPlanUseCase implements IEditPTPlanUseCase {
  constructor(
    private readonly ptPlanRepository: IPTPlanRepository,
    private readonly s3Service: S3Service
  ) {}

  async execute(data: IEditPTPlanRequestToEntity, planId: string, trainerId: string): Promise<IResponseDTO<PTPlan>> {
    try {
      const plan = await this.ptPlanRepository.findById(planId);
      if (!plan || plan.createdBy !== trainerId || !plan.isActive) {
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          error: {
            code: ERRORMESSAGES.PTPLAN_NOT_FOUND.code,
            message: ERRORMESSAGES.PTPLAN_NOT_FOUND.message,
          },
        };
      }

      // Handle image upload if provided
      let imageUrl = plan.image;
      if (data.image) {
        if (imageUrl) {
          await this.s3Service.deleteFile(imageUrl);
        }
        imageUrl = data.image;
      }

  

    // Prepare update data with defaults from existing plan
    const updateData: IPTPlanRequestToEntity = {
        title: data.title ?? plan.title,
        category: data.category ?? plan.category,
        mode: data.mode ?? plan.mode,
        description: data.description ?? plan.description,
        goal: data.goal ?? plan.goal,
        features: data.features ?? plan.features,
        duration: data.duration ?? plan.duration,
        image: imageUrl,
        trainerPrice: data.trainerPrice ?? plan.trainerPrice,
        createdBy: plan.createdBy,
        adminPrice: plan.adminPrice, // Preserve existing adminPrice
        totalPrice: (data.trainerPrice ?? plan.trainerPrice) + (plan.adminPrice ?? 0), // Recalculate totalPrice
      };

      // Validate updated data using PTPlan.create
      const validatedPlan = PTPlan.create(updateData);

      // Update in repository
      const updatedPlan = await this.ptPlanRepository.update(planId, {
        ...validatedPlan.toJSON(),
        verifiedByAdmin: false,
        updatedAt: new Date(),
      });
      if (!updatedPlan) {
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          error: {
            code: ERRORMESSAGES.PTPLAN_NOT_FOUND.code,
            message: ERRORMESSAGES.PTPLAN_NOT_FOUND.message,
          },
        };
      }

      // Generate presigned URL for the response
   imageUrl = updatedPlan.image ? await this.s3Service.getPresignedUrl(updatedPlan.image) : null;

      return {
        success: true,
        status: HttpStatus.OK,
        data: {...updatedPlan.toJSON(),image:imageUrl},
        message: MESSAGES.PTPLAN_UPDATED,
      };
    } catch (error) {
      console.error('[ERROR] Edit PT plan error:', error);
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