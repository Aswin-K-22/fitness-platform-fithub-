// backend/src/presentation/controllers/trainer/trainer.controller.ts
import { Request, Response } from 'express';
import { IGetTrainerUseCase } from '@/app/useCases/interfaces/IGetTrainerUseCase';
import { IGetTrainerProfileUseCase } from '@/app/useCases/interfaces/IGetTrainerProfileUseCase';
import { IUpdateTrainerProfileUseCase } from '@/app/useCases/interfaces/IUpdateTrainerProfileUseCase';
import { IUpdateTrainerProfileRequestDTO } from '@/domain/dtos/updateTrainerProfileRequest.dto';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { IResponseDTO } from '@/domain/dtos/response.dto';
import { ICreatePTPlanUseCase } from '@/app/useCases/interfaces/ICreatePTPlanUseCase';
import { CreatePTPlanRequestDTO, ICreatePTPlanRequestDTO } from '@/domain/dtos/createPTPlanRequest.dto';
import { S3Service } from '@/infra/providers/s3.service';
import { PTPlansRequestDTO } from '@/domain/dtos/pTPlanRequestDTO';
import { IPTPlansTrainerGetUseCase } from '@/app/useCases/interfaces/IPTPlansTrainerGetUseCase';
import { IGetPTPlansResponseDTO } from '@/domain/dtos/getPTPlansResponse.dto';
import { IEditPTPlanUseCase } from '@/app/useCases/interfaces/IEditPTPlanUseCase';
import { EditPTPlanRequestDTO } from '@/domain/dtos/editPTPlanRequest.dto';
import { StopPTPlanRequestDTO } from '@/domain/dtos/stopResumePTPlanRequest.dto';
import { IResumePTPlanUseCase, IStopPTPlanUseCase } from '@/app/useCases/interfaces/IStopResumePTPlanUseCase';
import { UpdateTrainerProfileRequestDTO } from '@/domain/dtos/updateTrainerProfileResponse.dto';


export class TrainerController {
  constructor(
    private readonly getTrainerUseCase: IGetTrainerUseCase,
    private readonly getTrainerProfileUseCase: IGetTrainerProfileUseCase,
    private readonly updateTrainerProfileUseCase: IUpdateTrainerProfileUseCase,
    private readonly createPTPlanUseCase: ICreatePTPlanUseCase,
    private s3Service: S3Service,
    private readonly ptPlansTrainerGetUseCase : IPTPlansTrainerGetUseCase,
    private readonly editPTPlanUseCase : IEditPTPlanUseCase,
    private readonly stopPTPlanUseCase : IStopPTPlanUseCase,
    private readonly resumePTPlanUseCase: IResumePTPlanUseCase
  ) {}

  private sendResponse<T>(res: Response, result: IResponseDTO<T>): void {
    res.status(result.status).json({
      success: result.success,
      message: result.message,
      ...(result.success ? { data: result.data } : { error: result.error }),
    });
  }

  async getTrainer(req: Request, res: Response): Promise<void> {
    if (!req.trainer?.email) {
      this.sendResponse(res, {
        success: false,
        status: HttpStatus.UNAUTHORIZED,
        error: {
          code: ERRORMESSAGES.TRAINER_NOT_AUTHENTICATED.code,
          message: ERRORMESSAGES.TRAINER_NOT_AUTHENTICATED.message,
        },
      });
      return;
    }

    try {
      const result = await this.getTrainerUseCase.execute(req.trainer.email);
      this.sendResponse(res, result);
    } catch (error) {
      console.error('[ERROR] Get trainer error:', error);
      this.sendResponse(res, {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: ERRORMESSAGES.GENERIC_ERROR.code,
          message: ERRORMESSAGES.GENERIC_ERROR.message,
        },
      });
    }
  }

  async getTrainerProfile(req: Request, res: Response): Promise<void> {
    if (!req.trainer?.email) {
      this.sendResponse(res, {
        success: false,
        status: HttpStatus.UNAUTHORIZED,
        error: {
          code: ERRORMESSAGES.TRAINER_NOT_AUTHENTICATED.code,
          message: ERRORMESSAGES.TRAINER_NOT_AUTHENTICATED.message,
        },
      });
      return;
    }

    try {
      const result = await this.getTrainerProfileUseCase.execute(req.trainer.email);
      this.sendResponse(res, result);
    } catch (error) {
      console.error('[ERROR] Get trainer profile error:', error);
      this.sendResponse(res, {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: ERRORMESSAGES.GENERIC_ERROR.code,
          message: ERRORMESSAGES.GENERIC_ERROR.message,
        },
      });
    }
  }

async updateTrainerProfile(req: Request, res: Response): Promise<void> {
    try {
        const validatedData = req.validatedData as UpdateTrainerProfileRequestDTO;
        const trainerId = req.trainer?.id;

        if (!trainerId) {
            throw new Error(ERRORMESSAGES.TRAINER_NOT_AUTHENTICATED.message);
        }

        let profilePicUrl: string | null = null;

        // Handle image upload
        if (req.file) {
            const key = `trainer-profiles/${trainerId}/${Date.now()}-${req.file.originalname}`;
            profilePicUrl = await this.s3Service.uploadFile(req.file, key);
        }

        const result = await this.updateTrainerProfileUseCase.execute({
            ...validatedData,
            profilePic: profilePicUrl,
        }, trainerId);

        this.sendResponse(res, result);
    } catch (error: any) {
        console.error('[ERROR] Update Trainer Profile error: from trainer.controller.ts', error);
        const response: IResponseDTO<null> = {
            success: false,
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: {
                code: error.message.includes('TRAINER_PROFILE') ? error.message.split(':')[0] : ERRORMESSAGES.GENERIC_ERROR.code,
                message: error.message || ERRORMESSAGES.GENERIC_ERROR.message,
            },
        };
        this.sendResponse(res, response);
    }
}

  async createPTPlan(req: Request, res: Response): Promise<void> {

try {
    const validatedData = req?.validatedData as CreatePTPlanRequestDTO;
      let imageUrl: string | null = null;

      // Handle image upload
      if (req.file) {
        const key = `pt-plans/${validatedData.createdBy}/${Date.now()}-${req.file.originalname}`;
        imageUrl = await this.s3Service.uploadFile(req.file, key);
      }

      const result = await this.createPTPlanUseCase.execute({
        ...validatedData.toEntity(),
        image: imageUrl,
      });

      this.sendResponse(res, result);
    } catch (error: any) {
      console.error('[ERROR] Create PTPlan error: from trainer.controller.ts', error);
      this.sendResponse(res, {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: ERRORMESSAGES.GENERIC_ERROR.code,
          message: ERRORMESSAGES.GENERIC_ERROR.message,
        },
      });
    }

  }
async getPTPlans(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = req.PTPlansGetRequestDTO as PTPlansRequestDTO;
      const trainerId = req.trainer?.id;

      if (!trainerId) {
        throw new Error(ERRORMESSAGES.TRAINER_NOT_AUTHENTICATED.message);
      }

      const result = await this.ptPlansTrainerGetUseCase.execute(validatedData.toEntity(), trainerId);
      this.sendResponse(res, result);
    } catch (error: any) {
      console.error('[ERROR] Get PTPlans error: from trainer.controller.ts', error);
      const response: IGetPTPlansResponseDTO = {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          plans: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          },
        },
        error: {
          code: ERRORMESSAGES.GENERIC_ERROR.code,
          message: ERRORMESSAGES.GENERIC_ERROR.message,
        },
      };
      this.sendResponse(res, response);
    }
  }
  async editPTPlan(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = req.editPTPlanRequestDTO as EditPTPlanRequestDTO;
      const trainerId = req.trainer?.id;
      const planId = req.params.id;
       let imageUrl: string | null = null;

      // Handle image upload
    
      if (!trainerId) {
        throw new Error(ERRORMESSAGES.TRAINER_NOT_AUTHENTICATED.message);
      }

        if (req.file) {
        const key = `pt-plans/${trainerId}/${Date.now()}-${req.file.originalname}`;
        imageUrl = await this.s3Service.uploadFile(req.file, key);
      }


      const result = await this.editPTPlanUseCase.execute({
        ...validatedData.toEntity(),
        image: imageUrl,
      }, planId, trainerId);
      this.sendResponse(res, result);
    } catch (error: any) {
      console.error('[ERROR] Edit PTPlan error: from trainer.controller.ts', error);
      const response: IResponseDTO<null> = {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        data: null,
        error: {
          code: ERRORMESSAGES.GENERIC_ERROR.code,
          message: ERRORMESSAGES.GENERIC_ERROR.message,
        },
      };
      this.sendResponse(res, response);
    }
  }

async stopPTPlan(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = req.validatedData as StopPTPlanRequestDTO;
      const trainerId = req.trainer?.id;
      if (!trainerId) {
        throw new Error(ERRORMESSAGES.TRAINER_NOT_AUTHENTICATED.message);
      }
      const result = await this.stopPTPlanUseCase.execute({
        planId: validatedData.planId,
        trainerId, // Pass trainerId
      });
      this.sendResponse(res, result);
    } catch (error: any) {
      console.error('[ERROR] Stop PTPlan error: from trainer.controller.ts', error);
      this.sendResponse(res, {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: ERRORMESSAGES.GENERIC_ERROR.code,
          message: ERRORMESSAGES.GENERIC_ERROR.message,
        },
      });
    }
  }

  async resumePTPlan(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = req.validatedData as StopPTPlanRequestDTO;
      const trainerId = req.trainer?.id;
      if (!trainerId) {
        throw new Error(ERRORMESSAGES.TRAINER_NOT_AUTHENTICATED.message);
      }
      const result = await this.resumePTPlanUseCase.execute({
        planId: validatedData.planId,
        trainerId, // Pass trainerId
      });
      this.sendResponse(res, result);
    } catch (error: any) {
      console.error('[ERROR] Resume PTPlan error: from trainer.controller.ts', error);
      this.sendResponse(res, {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: ERRORMESSAGES.GENERIC_ERROR.code,
          message: ERRORMESSAGES.GENERIC_ERROR.message,
        },
      });
    }
  }
}

  
