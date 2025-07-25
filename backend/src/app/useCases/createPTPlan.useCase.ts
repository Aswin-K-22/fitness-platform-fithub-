// src/app/useCases/createPTPlan.useCase.ts
import { ICreatePTPlanUseCase } from './interfaces/ICreatePTPlanUseCase';
import { IPTPlanRequestToEntity } from '@/domain/dtos/createPTPlanRequest.dto';
import { ICreatePTPlanResponseDTO } from '@/domain/dtos/createPTPlanResponse.dto';
import { IPTPlanRepository } from '@/app/repositories/ptPlan.repository';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { PTPlan } from '@/domain/entities/PTPlan.entity';
import { MESSAGES } from '@/domain/constants/messages.constant';

export class CreatePTPlanUseCase implements ICreatePTPlanUseCase {
  constructor(private readonly ptPlanRepository: IPTPlanRepository) {}

  async execute(data: IPTPlanRequestToEntity): Promise<ICreatePTPlanResponseDTO> {
    try {
      const ptPlan = PTPlan.create(data);
      const createdPTPlan = await this.ptPlanRepository.create(ptPlan);

      return {
        success: true,
        status: HttpStatus.CREATED,
        data: createdPTPlan,
        message: MESSAGES.PTPLAN_ADDED,
      };
    } catch (error) {
      console.error('[ERROR] Create PT plan error:', error);
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