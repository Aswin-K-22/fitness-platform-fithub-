// src/presentation/controllers/admin/admin.controller.ts

import { Request, Response } from 'express';
import { IGetAdminUseCase } from '@/app/useCases/interfaces/IGetAdminUseCase';
import { IGetUsersUseCase } from '@/app/useCases/interfaces/IGetUsersUseCase';
import { IToggleUserVerificationUseCase } from '@/app/useCases/interfaces/IToggleUserVerificationUseCase';
import { IGetTrainersUseCase } from '@/app/useCases/admin/interfeces/IGetTrainersUseCase';
import { IApproveTrainerUseCase } from '@/app/useCases/interfaces/IApproveTrainerUseCase';
import { IGetAdminGymsUseCase } from '@/app/useCases/interfaces/IGetAdminGymsUseCase';
import { IAddGymUseCase } from '@/app/useCases/interfaces/IAddGymUseCase';
import { IGetAvailableTrainersUseCase } from '@/app/useCases/interfaces/IGetAvailableTrainersUseCase';
import { IGetAdminMembershipPlansUseCase } from '@/app/useCases/interfaces/IGetAdminMembershipPlansUseCase';
import { IAddMembershipPlanUseCase } from '@/app/useCases/interfaces/IAddMembershipPlanUseCase';
import { IGetUsersRequestDTO } from '@/domain/dtos/getUsersRequest.dto';
import { AddGymRequestDTO } from '@/domain/dtos/addGymRequest.dto';
import { IResponseDTO } from '@/domain/dtos/response.dto';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { MulterError } from 'multer';
import { GymErrorType } from '@/domain/enums/gymErrorType.enums';
import { IAdminController } from '@/app/controllers/interfaces/admin/IAdminController';
import { AdminPTPlansRequestDTO } from '@/domain/dtos/adminPTPlansRequestDTO';
import { IAdminPTPlansGetUseCase } from '@/app/useCases/admin/interfeces/IAdminPTPlansGetUseCase';
import { IGetPTPlansResponseDTO } from '@/domain/dtos/getPTPlansResponse.dto';
import { CustomRequest } from '@/types/customRequest'
import { UpdateAdminPriceRequestDTO } from '@/domain/dtos/updateAdminPriceRequestDTO';
import { VerifyPTPlanRequestDTO } from '@/domain/dtos/verifyPTPlanRequestDTO';
import { IVerifyPTPlanUseCase } from '@/app/useCases/admin/interfeces/IVerifyPTPlanUseCase';
import { IUpdatePTPlanAdminPriceUseCase } from '@/app/useCases/admin/interfeces/IUpdatePTPlanAdminPriceUseCase';
import { AdminTrainersRequestDTO } from '@/domain/dtos/admin/adminTrainersRequestDTO';
import { IGetTrainersResponseDTO } from '@/domain/dtos/getTrainersResponse.dto';

export class AdminController implements IAdminController {
  constructor(
    private readonly getAdminUseCase: IGetAdminUseCase,
    private readonly getUsersUseCase: IGetUsersUseCase,
    private readonly toggleUserVerificationUseCase: IToggleUserVerificationUseCase,
    private readonly getTrainersUseCase: IGetTrainersUseCase,
    private readonly approveTrainerUseCase: IApproveTrainerUseCase,
    private readonly getAdminGymsUseCase: IGetAdminGymsUseCase,
    private readonly addGymUseCase: IAddGymUseCase,
    private readonly getAvailableTrainersUseCase: IGetAvailableTrainersUseCase,
    private readonly getAdminMembershipPlansUseCase: IGetAdminMembershipPlansUseCase,
    private readonly addMembershipPlanUseCase: IAddMembershipPlanUseCase,
    private readonly adminPTPlansGetUseCase : IAdminPTPlansGetUseCase,
    private readonly verifyPTPlanUseCase: IVerifyPTPlanUseCase,
    private readonly updatePTPlanAdminPriceUseCase: IUpdatePTPlanAdminPriceUseCase,
  ) {}


  private sendResponse<T>(res: Response, result: IResponseDTO<T>): void {
    res.status(result.status).json({
      success: result.success,
      message: result.message,
      ...(result.success ? { data: result.data } : { error: result.error }),
    });
  }

  async getAdmin(req: Request, res: Response): Promise<void> {
    const email = req.admin?.email;
    if (!email) {
      return this.sendResponse(res, {
        success: false,
        status: HttpStatus.UNAUTHORIZED,
        error: {
          code: ERRORMESSAGES.AUTH_USER_NOT_AUTHENTICATED.code,
          message: ERRORMESSAGES.AUTH_USER_NOT_AUTHENTICATED.message,
        },
      });
    }

    const result = await this.getAdminUseCase.execute(email);
    this.sendResponse(res, result);
  }

  async getUsers(req: Request, res: Response): Promise<void> {
    const params: IGetUsersRequestDTO = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 3,
      search: req.query.search as string | undefined,
      membership: req.query.membership as string | undefined,
      isVerified: req.query.isVerified as string | undefined,
    };

    const result = await this.getUsersUseCase.execute(params);
    this.sendResponse(res, result);
  }

  async toggleUserVerification(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const result = await this.toggleUserVerificationUseCase.execute({ userId });
    this.sendResponse(res, result);
  }

async getTrainers(req: CustomRequest, res: Response): Promise<void> {
  try {
    const validatedData = req.validatedData as AdminTrainersRequestDTO;
    const adminId = req.admin?.id;

    if (!adminId) {
      throw new Error(ERRORMESSAGES.ADMIN_NOT_AUTHENTICATED.message);
    }

    const result = await this.getTrainersUseCase.execute(validatedData.toEntity());
    this.sendResponse(res, result);
  } catch (error: any) {
    console.error('[ERROR] Get Trainers error: from admin.controller.ts', error);
    const response: IGetTrainersResponseDTO = {
      success: false,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      data: {
        trainers: [],
        stats: {
          totalTrainers: 0,
          pendingApproval: 0,
          activeTrainers: 0,
          suspended: 0,
        },
        totalPages: 0,
      },
      error: {
        code: ERRORMESSAGES.GENERIC_ERROR.code,
        message: ERRORMESSAGES.GENERIC_ERROR.message,
      },
    };
    this.sendResponse(res, response);
  }
}

  async approveTrainer(req: Request, res: Response): Promise<void> {
    const { trainerId } = req.params;
    const result = await this.approveTrainerUseCase.execute({ trainerId });
    this.sendResponse(res, result);
  }

  async getGyms(req: Request, res: Response): Promise<void> {
    const { page, limit, search } = req.query;
    const request = {
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 5,
      search: typeof search === 'string' ? search : undefined,
    };

    const result = await this.getAdminGymsUseCase.execute(request);
    this.sendResponse(res, result);
  }

 async addGym(req: Request, res: Response): Promise<void> {
    try {
      const imageFiles = req.files as Express.Multer.File[] | undefined;
      const imageUrls = imageFiles?.map((file) => `/Uploads/${file.filename}`) || [];

      if (!req.body.gymData) {
        throw new Error(GymErrorType.MissingRequiredFields);
      }

      const gymData: AddGymRequestDTO = JSON.parse(req.body.gymData);

      const response = await this.addGymUseCase.execute(gymData, imageUrls);

      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating gym:', error);
      if (error instanceof MulterError) {
        console.error('Error creating gym:', error);
        if (error.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({
            success: false,
            message: 'Uploaded file is too large. Maximum size allowed is 10MB.',
            error: error.code,
          });
          return;
        }
        res.status(400).json({
          success: false,
          message: `Multer error: ${error.message}`,
          error: error.code,
        });
        return;
      }
      const message = error instanceof Error ? error.message : 'Internal server error while creating gym';
      res.status(message.includes(GymErrorType.DuplicateGymName) ? 409 : 400).json({
        success: false,
        message,
      });
    }
  }


  async getAvailableTrainers(req: Request, res: Response): Promise<void> {
    const result = await this.getAvailableTrainersUseCase.execute();
    this.sendResponse(res, result);
  }

  async getMembershipPlans(req: Request, res: Response): Promise<void> {
    const { page = 1, limit = 10 } = req.query;
    const request = {
      page: Number(page),
      limit: Number(limit),
    };

    const result = await this.getAdminMembershipPlansUseCase.execute(request);
    this.sendResponse(res, result);
  }

  async addMembershipPlan(req: Request, res: Response): Promise<void> {
    const result = await this.addMembershipPlanUseCase.execute(req.body);
    this.sendResponse(res, result);
  }

  
async getTrainerPTPlans(req:CustomRequest, res: Response): Promise<void> {
  try {
    const validatedData = req.validatedData as AdminPTPlansRequestDTO;
    const adminId = req.admin?.id;

    if (!adminId) {
      throw new Error(ERRORMESSAGES.ADMIN_NOT_AUTHENTICATED.message);
    }

    const result = await this.adminPTPlansGetUseCase.execute(validatedData.toEntity());
    this.sendResponse(res, result);
  } catch (error: any) {
    console.error('[ERROR] Get Trainer PTPlans error: from admin.controller.ts', error);
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


async verifyPTPlan(req: CustomRequest, res: Response): Promise<void> {
  try {
    const validatedData = req.validatedData as VerifyPTPlanRequestDTO;
    const adminId = req.admin?.id;

    if (!adminId) {
      throw new Error(ERRORMESSAGES.ADMIN_NOT_AUTHENTICATED.message);
    }

    const result = await this.verifyPTPlanUseCase.execute(validatedData.toEntity());
    this.sendResponse(res, result);
  } catch (error: any) {
    console.error('[ERROR] Verify PT Plan error: from admin.controller.ts', error);
    const response: IResponseDTO<null> = {
      success: false,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Failed to verify PT plan',
      error: {
        code: error.message.includes('PTPLAN') ? error.message : ERRORMESSAGES.GENERIC_ERROR.code,
        message: error.message || ERRORMESSAGES.GENERIC_ERROR.message,
      },
    };
    this.sendResponse(res, response);
  }
}

async updatePTPlanAdminPrice(req: CustomRequest, res: Response): Promise<void> {
  try {
    const validatedData = req.validatedData as UpdateAdminPriceRequestDTO;
    const adminId = req.admin?.id;

    if (!adminId) {
      throw new Error(ERRORMESSAGES.ADMIN_NOT_AUTHENTICATED.message);
    }

    const result = await this.updatePTPlanAdminPriceUseCase.execute(validatedData.toEntity());
    this.sendResponse(res, result);
  } catch (error: any) {
    console.error('[ERROR] Update PT Plan Admin Price error: from admin.controller.ts', error);
    const response: IResponseDTO<null> = {
      success: false,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Failed to update PT plan admin price',
      error: {
        code: error.message.includes('PTPLAN') ? error.message : ERRORMESSAGES.GENERIC_ERROR.code,
        message: error.message || ERRORMESSAGES.GENERIC_ERROR.message,
      },
    };
    this.sendResponse(res, response);
  }
}
}