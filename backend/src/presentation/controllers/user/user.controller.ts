// src/presentation/controllers/user/user.controller.ts
import { Request, Response } from 'express';
import { IGetUserUseCase } from '@/app/useCases/interfaces/IGetUserUseCase';
import { IGetGymsUseCase } from '@/app/useCases/interfaces/IGetGymsUseCase';
import { IGetGymDetailsUseCase } from '@/app/useCases/interfaces/IGetGymDetailsUseCase';
import { IGetMembershipPlansUseCase } from '@/app/useCases/interfaces/IGetMembershipPlansUseCase';
import { IInitiateMembershipPaymentUseCase } from '@/app/useCases/user/interfaces/IInitiateMembershipPaymentUseCase';
import { IVerifyMembershipPaymentUseCase } from '@/app/useCases/interfaces/IVerifyMembershipPaymentUseCase';
import { IUpdateUserProfileUseCase } from '@/app/useCases/interfaces/IUpdateUserProfileUseCase';
import { IGetUserProfileUseCase } from '@/app/useCases/interfaces/IGetUserProfileUseCase';
import { GetGymsRequestDTO } from '@/domain/dtos/getGymsRequest.dto';
import { GetGymDetailsRequestDTO } from '@/domain/dtos/getGymDetailsRequest.dto';
import { GetMembershipPlansRequestDTO, GetMembershipPlansRequestSchema } from '@/domain/dtos/getMembershipPlansRequest.dto';
import { InitiateMembershipPaymentRequestDTO } from '@/domain/dtos/initiateMembershipPayment.dto';
import { VerifyMembershipPaymentRequestDTO } from '@/domain/dtos/verifyMembershipPayment.dto';
import { IUpdateUserProfileRequestDTO } from '@/domain/dtos/updateUserProfileRequest.dto';
import { IResponseDTO } from '@/domain/dtos/response.dto';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { MESSAGES } from '@/domain/constants/messages.constant';
import { INotificationsRepository } from '@/app/repositories/notifications.repository';
import { IGetNotificationsUseCase } from '@/app/useCases/interfaces/IGetNotificationsUseCase';
import { IMarkNotificationReadUseCase } from '@/app/useCases/interfaces/IMarkNotificationReadUseCase';
import { IGetPTPlansResponseDTO } from '@/domain/dtos/getPTPlansResponse.dto';
import { CustomRequest } from '@/types/customRequest';
import { UserPTPlansRequestDTO } from '@/domain/dtos/user/userPTPlanRequestDTO';
import { IPTPlansUserGetUseCase } from '@/app/useCases/user/interfaces/IPTPlansUserGetUseCase';
import { IGetUserCurrentPlansUseCase } from '@/app/useCases/user/interfaces/IGetUserCurrentPalnsUseCase';

export class UserController {
  constructor(
    private getUserUseCase: IGetUserUseCase,
    private getGymsUseCase: IGetGymsUseCase,
    private getGymDetailsUseCase: IGetGymDetailsUseCase,
    private getMembershipPlansUseCase: IGetMembershipPlansUseCase,
    private initiateMembershipPaymentUseCase: IInitiateMembershipPaymentUseCase,
    private verifyMembershipPaymentUseCase: IVerifyMembershipPaymentUseCase,
    private getUserProfileUseCase: IGetUserProfileUseCase,
    private updateUserProfileUseCase: IUpdateUserProfileUseCase,
    private getNotificationsUseCase: IGetNotificationsUseCase,
    private markNotificationReadUseCase: IMarkNotificationReadUseCase,
    private ptPlansUserGetUseCase : IPTPlansUserGetUseCase,
    private getUserCurrentPlansUseCase: IGetUserCurrentPlansUseCase
  ) {}

  private sendResponse<T>(res: Response, result: IResponseDTO<T>): void {
    res.status(result.status).json({
      success: result.success,
      message: result.message,
      ...(result.success ? { data: result.data } : { error: result.error }),
    });
  }

  async getNotifications(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
     if (!userId) {
      return this.sendResponse(res, {
        success: false,
        status: HttpStatus.UNAUTHORIZED,
        error: {
          code: ERRORMESSAGES.NOTIFICATION_UNAUTHORIZED.code,
          message: ERRORMESSAGES.NOTIFICATION_UNAUTHORIZED.message,
        },
      });
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const response = await this.getNotificationsUseCase.execute(userId, page, limit);
    this.sendResponse(res, response);
  }

  async markNotificationRead(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
     if (!userId) {
      return this.sendResponse(res, {
        success: false,
        status: HttpStatus.UNAUTHORIZED,
        error: {
          code: ERRORMESSAGES.NOTIFICATION_UNAUTHORIZED.code,
          message: ERRORMESSAGES.NOTIFICATION_UNAUTHORIZED.message,
        },
      });
    }
    const notificationId = req.params.notificationId;
    const response = await this.markNotificationReadUseCase.execute(userId, notificationId);
    this.sendResponse(res, response);
  }

  async updateUserProfile(req: Request, res: Response): Promise<void> {
    const email = req.user?.email;
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

    const requestDTO: IUpdateUserProfileRequestDTO = {
      name: req.body.name,
      profilePic: req.file ? `/uploads/${req.file.filename}` : undefined,
    };

    const result = await this.updateUserProfileUseCase.execute(email, requestDTO);
    this.sendResponse(res, result);
  }

  async getUser(req: Request, res: Response): Promise<void> {
    const email = req.user?.email;
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

    const result = await this.getUserUseCase.execute(email);
    this.sendResponse(res, result);
  }

  async getUserProfile(req: Request, res: Response): Promise<void> {
    const email = req.user?.email;
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

    const result = await this.getUserProfileUseCase.execute(email);
    this.sendResponse(res, result);
  }

  async getGyms(req: Request, res: Response): Promise<void> {
    const { page, limit, search, lat, lng, radius, gymType, rating } = req.query;

    const requestDTO: GetGymsRequestDTO = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string | undefined,
      lat: lat ? parseFloat(lat as string) : undefined,
      lng: lng ? parseFloat(lng as string) : undefined,
      radius: radius ? parseInt(radius as string) : undefined,
      gymType: gymType as string | undefined,
      rating: rating as string | undefined,
    };

    const result = await this.getGymsUseCase.execute(requestDTO);
    this.sendResponse(res, result);
  }

  async getGymDetails(req: Request, res: Response): Promise<void> {
    const { gymId } = req.params;
    const requestDTO: GetGymDetailsRequestDTO = { gymId };

    const result = await this.getGymDetailsUseCase.execute(requestDTO);
    this.sendResponse(res, result);
  }

  async getMembershipPlans(req: Request, res: Response): Promise<void> {
    try {
      const requestDTO: GetMembershipPlansRequestDTO = GetMembershipPlansRequestSchema.parse(req.query);
      const result = await this.getMembershipPlansUseCase.execute(requestDTO.page, requestDTO.limit);
      this.sendResponse(res, result);
    } catch (error) {
      this.sendResponse(res, {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        error: {
          code: ERRORMESSAGES.MEMBERSHIP_INVALID_PAGINATION.code,
          message: ERRORMESSAGES.MEMBERSHIP_INVALID_PAGINATION.message,
        },
      });
    }
  }

  async initiateMembershipPayment(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      return this.sendResponse(res, {
        success: false,
        status: HttpStatus.UNAUTHORIZED,
        error: {
          code: ERRORMESSAGES.MEMBERSHIP_UNAUTHORIZED.code,
          message: ERRORMESSAGES.MEMBERSHIP_UNAUTHORIZED.message,
        },
      });
    }

    const requestDTO: InitiateMembershipPaymentRequestDTO = {
      planId: req.body.planId,
    };

    const result = await this.initiateMembershipPaymentUseCase.execute(requestDTO, userId);
    this.sendResponse(res, result);
  }

  async verifyMembershipPayment(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      return this.sendResponse(res, {
        success: false,
        status: HttpStatus.UNAUTHORIZED,
        error: {
          code: ERRORMESSAGES.MEMBERSHIP_UNAUTHORIZED.code,
          message: ERRORMESSAGES.MEMBERSHIP_UNAUTHORIZED.message,
        },
      });
    }

    const requestDTO: VerifyMembershipPaymentRequestDTO = {
      razorpay_payment_id: req.body.razorpay_payment_id,
      razorpay_order_id: req.body.razorpay_order_id,
      razorpay_signature: req.body.razorpay_signature,
      planId: req.body.planId,
    };

    const result = await this.verifyMembershipPaymentUseCase.execute(requestDTO, userId);
    this.sendResponse(res, result);
  }


  async getPTPlans(req: CustomRequest, res: Response): Promise<void> {
    try {
      const validatedData = req.validatedData as UserPTPlansRequestDTO;
      

      const result = await this.ptPlansUserGetUseCase.execute(validatedData.toEntity());
      this.sendResponse(res, result);
    } catch (error: any) {
      console.error('[ERROR] Get PTPlans error: from user.controller.ts', error);
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
          code: error.message.includes('PTPLAN_') ? error.message : ERRORMESSAGES.GENERIC_ERROR.code,
          message: error.message || ERRORMESSAGES.GENERIC_ERROR.message,
        },
      };
      this.sendResponse(res, response);
    }
  }
  async getUserCurrentPlans(req: CustomRequest, res: Response): Promise<void> {
  const userId: string = req.user?.id ?? '';

  const result = await this.getUserCurrentPlansUseCase.execute(userId);
  this.sendResponse(res, result);
}

}