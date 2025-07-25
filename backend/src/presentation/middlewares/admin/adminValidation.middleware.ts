// src/presentation/middlewares/admin/adminValidationMiddleware.ts
import {  Response, NextFunction } from 'express';
import { IAdminValidationMiddleware } from "@/app/middlewares/interfaces/admin/IAdminValidationMiddleware";
import { ERRORMESSAGES } from "@/domain/constants/errorMessages.constant";
import { AdminPTPlansRequestDTO } from "@/domain/dtos/adminPTPlansRequestDTO";
import { IResponseDTO } from "@/domain/dtos/response.dto";
import { IGetPTPlansResponseDTO } from '@/domain/dtos/getPTPlansResponse.dto';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { CustomRequest } from '@/types/customRequest'
import { VerifyPTPlanRequestDTO } from '@/domain/dtos/verifyPTPlanRequestDTO';
import { UpdateAdminPriceRequestDTO } from '@/domain/dtos/updateAdminPriceRequestDTO';



export class AdminValidationMiddleware implements IAdminValidationMiddleware {
  private sendResponse<T>(res: Response, result: IResponseDTO<T>): void {
    res.status(result.status).json({
      success: result.success,
      message: result.message,
      ...(result.success ? { data: result.data } : { error: result.error }),
    });
  }

  async validateGetTrainerPTPlans(req:CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.admin?.id) {
        throw new Error(ERRORMESSAGES.ADMIN_NOT_AUTHENTICATED.message);
      }

      const ptPlansRequestDTO = new AdminPTPlansRequestDTO({
        page: req.query.page?.toString() || '1',
        limit: req.query.limit?.toString() || '10',
        verifiedByAdmin: req.query.verifiedByAdmin ? req.query.verifiedByAdmin === 'true' : undefined,
      });

      req.validatedData = ptPlansRequestDTO;
      next();
    } catch (error: any) {
      console.error('[ERROR] Admin middleware-validation error: from validateGetTrainerPTPlans', error);
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

  async validateVerifyPlanInput(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.admin?.id) {
        throw new Error(ERRORMESSAGES.ADMIN_NOT_AUTHENTICATED.message);
      }

      const data = {
        planId: req.params.planId,
        verifiedByAdmin: true,
      };

      const validatedData = new VerifyPTPlanRequestDTO(data);
      

      req.validatedData =  validatedData ;
      next();
    } catch (error: any) {
      console.error('[ERROR] Admin middleware-validation error: from validateVerifyPlanInput', error);
      const response: IResponseDTO<null> = {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        error: {
          code: error.message.includes('PTPLAN') ? error.message : 'VALIDATION_ERROR',
          message: error.message || 'Validation failed',
        },
      };
      res.status(response.status).json(response);
    }
  }

  async validateAdminPriceInput(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.admin?.id) {
      throw new Error(ERRORMESSAGES.ADMIN_NOT_AUTHENTICATED.message);
    }

    const data = {
      planId: req.params.planId,
      adminPrice: parseFloat(req.body.adminPrice),
    };

    

    req.validatedData = new UpdateAdminPriceRequestDTO(data);
    next();
  } catch (error: any) {
    console.error('[ERROR] Admin middleware-validation error: from validateAdminPriceInput', error);
    const response: IResponseDTO<null> = {
      success: false,
      status: HttpStatus.BAD_REQUEST,
      message: 'Validation failed',
      error: {
        code: error.message.includes('PTPLAN') ? error.message : 'VALIDATION_ERROR',
        message: error.message || 'Validation failed',
      },
    };
    res.status(response.status).json(response);
  }
}
}

