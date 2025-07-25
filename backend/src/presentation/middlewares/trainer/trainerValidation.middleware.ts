// src/presentation/middlewares/trainer/trainerValidation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ITrainerValidationMiddleware } from '@/app/middlewares/interfaces/ITrainerValidationMiddleware';
import { CreatePTPlanRequestDTO } from '@/domain/dtos/createPTPlanRequest.dto';
import { IResponseDTO } from '@/domain/dtos/response.dto';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { CreateTrainerRequestDTO } from '@/domain/dtos/createTrainerRequest.dto';
import { PTPlansRequestDTO } from '@/domain/dtos/pTPlanRequestDTO';
import { IGetPTPlansResponseDTO } from '@/domain/dtos/getPTPlansResponse.dto';
import { ResumePTPlanRequestDTO, StopPTPlanRequestDTO } from '@/domain/dtos/stopResumePTPlanRequest.dto';
import { EditPTPlanRequestDTO } from '@/domain/dtos/editPTPlanRequest.dto';
import { z } from 'zod';
import { UpdateTrainerProfileRequestDTO } from '@/domain/dtos/updateTrainerProfileResponse.dto';

export class TrainerValidationMiddleware implements ITrainerValidationMiddleware {

    private sendResponse<T>(res: Response, result: IResponseDTO<T>): void {
      res.status(result.status).json({
        success: result.success,
        message: result.message,
        ...(result.success ? { data: result.data } : { error: result.error }),
      });
    }


  async validateUpdateTrainerProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        // Ensure trainer is authenticated
        if (!req.trainer?.id) {
            throw new Error(ERRORMESSAGES.TRAINER_NOT_AUTHENTICATED.message);
        }

        // Validate request body and attach DTO
        const profileData = new UpdateTrainerProfileRequestDTO(req.body);

        // Attach validated DTO to request
        req.validatedData = profileData;

        next();
    } catch (error: any) {
        console.error('[ERROR] Trainer middleware-validation error: from validateUpdateTrainerProfile ', error);
        const response: IResponseDTO<null> = {
            success: false,
            status: HttpStatus.BAD_REQUEST,
            error: {
                code: error.message.includes('TRAINER_PROFILE') ? error.message.split(':')[0] : 'VALIDATION_ERROR',
                message: error.message || 'Validation failed',
            },
        };
        res.status(response.status).json(response);
    }
}

  async validateCreatePTPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Ensure trainer is authenticated
      if (!req.trainer?.id) {
        throw new Error(ERRORMESSAGES.TRAINER_NOT_AUTHENTICATED.message);
      }

      // Validate request body and attach DTO
      const ptPlanData = new CreatePTPlanRequestDTO({
        ...req.body,
        createdBy: req.trainer.id, 
      });

      // Attach validated DTO to request
      req.validatedData = ptPlanData;

      next();
    } catch (error: any) {
      console.error('[ERROR] Trainer middleware-validation error: from validateCreatePTPlan ', error);
      const response: IResponseDTO<null> = {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        error: {
          code: error.message.includes('PTPLAN') ? error.message.split(':')[0] : 'VALIDATION_ERROR',
          message: error.message || 'Validation failed',
        },
      };
      res.status(response.status).json(response);
    }
  }
  async validateSignupTrainer(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {

    if (!req.trainer?.id) {
        throw new Error(ERRORMESSAGES.TRAINER_NOT_AUTHENTICATED.message);
      }
       new CreateTrainerRequestDTO(req.body);
  

   next();
    } catch (error: any) {
      console.error('[ERROR] Trainer middlware validation error: from validateSignupTrainer', error);
      const response: IResponseDTO<null> = {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message || 'Validation failed',
        },
      };
      res.status(response.status).json(response);
    }
  }

 async validateGetPTPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.trainer?.id) {
        throw new Error(ERRORMESSAGES.TRAINER_NOT_AUTHENTICATED.message);
      }

      const ptPlansRequestDTO = new PTPlansRequestDTO({
        page: req.query.page?.toString() || '1',
        limit: req.query.limit?.toString() || '10',
      });

      req.PTPlansGetRequestDTO = ptPlansRequestDTO;
      next();
    } catch (error: any) {
      console.error('[ERROR] Trainer middleware-validation error: from validateGetPTPlans', error);
      const response: IGetPTPlansResponseDTO = {
        success: false,
        status: HttpStatus.BAD_REQUEST,
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
          code: error.message.includes('PTPLAN') ? error.message : 'VALIDATION_ERROR',
          message: error.message || 'Validation failed',
        },
      };
      res.status(response.status).json(response);
    }
  }



async validateStopPTPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.trainer?.id) {
        throw new Error(ERRORMESSAGES.TRAINER_NOT_AUTHENTICATED.message);
      }

      const stopPlanData = new StopPTPlanRequestDTO({ planId: req.params.planId });
      req.validatedData = stopPlanData;
      next();
    } catch (error: any) {
      console.error('[ERROR] Trainer middleware-validation error: from validateStopPTPlan', {
        error: error.message,
        zodErrors: error instanceof z.ZodError ? error.errors : null,
      });
      const response: IResponseDTO<null> = {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        error: {
          code: error.message.includes('PTPLAN') ? error.message.split(':')[0] : 'VALIDATION_ERROR',
          message: error.message || 'Validation failed',
        },
      };
      res.status(response.status).json(response);
    }
  }

  async validateResumePTPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.trainer?.id) {
        throw new Error(ERRORMESSAGES.TRAINER_NOT_AUTHENTICATED.message);
      }

      const resumePlanData = new ResumePTPlanRequestDTO({ planId: req.params.planId }); // Use correct DTO
      req.validatedData = resumePlanData;
      next();
    } catch (error: any) {
      console.error('[ERROR] Trainer middleware-validation error: from validateResumePTPlan', {
        error: error.message,
        zodErrors: error instanceof z.ZodError ? error.errors : null,
      });
      const response: IResponseDTO<null> = {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        error: {
          code: error.message.includes('PTPLAN') ? error.message.split(':')[0] : 'VALIDATION_ERROR',
          message: error.message || 'Validation failed',
        },
      };
      res.status(response.status).json(response);
    }
  }


  async validateEditPTPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.trainer?.id) {
        throw new Error(ERRORMESSAGES.TRAINER_NOT_AUTHENTICATED.message);
      }

      const data = {
        ...req.body,
        image: req.file,
      };

      const editPTPlanRequestDTO = new EditPTPlanRequestDTO(data);
      req.editPTPlanRequestDTO = editPTPlanRequestDTO;
      next();
    } catch (error: any) {
      console.error('[ERROR] Trainer middleware-validation error: from validateEditPTPlan', error);
      const response: IResponseDTO<null> = {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        data: null,
        error: {
          code: error.message.includes('PTPLAN') ? error.message : 'VALIDATION_ERROR',
          message: error.message || 'Validation failed',
        },
      };
      res.status(response.status).json(response);
    }
  }


}


declare module 'express' {
  interface Request {
    validatedData?: CreatePTPlanRequestDTO | StopPTPlanRequestDTO | ResumePTPlanRequestDTO|UpdateTrainerProfileRequestDTO; // Add ResumePTPlanRequestDTO
    PTPlansGetRequestDTO?: PTPlansRequestDTO;
    editPTPlanRequestDTO?: EditPTPlanRequestDTO;
  }
}