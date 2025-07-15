import { Request, Response } from 'express';
import { IGetTrainerUseCase } from '@/app/useCases/interfaces/IGetTrainerUseCase';
import { IGetTrainerProfileUseCase } from '@/app/useCases/interfaces/IGetTrainerProfileUseCase';
import { IUpdateTrainerProfileUseCase } from '@/app/useCases/interfaces/IUpdateTrainerProfileUseCase';
import { IUpdateTrainerProfileRequestDTO } from '@/domain/dtos/updateTrainerProfileRequest.dto';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { IResponseDTO } from '@/domain/dtos/response.dto';

export class TrainerController {
  constructor(
    private readonly getTrainerUseCase: IGetTrainerUseCase,
    private readonly getTrainerProfileUseCase: IGetTrainerProfileUseCase,
    private readonly updateTrainerProfileUseCase: IUpdateTrainerProfileUseCase
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
      const data: IUpdateTrainerProfileRequestDTO = {
        name: req.body.name || undefined,
        bio: req.body.bio || undefined,
        specialties: req.body.specialties ? JSON.parse(req.body.specialties) : undefined,
        profilePic: req.file,
        upiId: req.body.upiId || undefined,
        bankAccount: req.body.bankAccount || undefined,
        ifscCode: req.body.ifscCode || undefined,
      };

      const result = await this.updateTrainerProfileUseCase.execute(req.trainer.email, data);
      this.sendResponse(res, result);
    } catch (error) {
      console.error('[ERROR] Update trainer profile error:', error);
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