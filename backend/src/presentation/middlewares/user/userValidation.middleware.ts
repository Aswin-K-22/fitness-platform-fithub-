import { Request, Response, NextFunction } from 'express';
import { IUserValidationMiddleware } from '@/app/middlewares/interfaces/user/IUserValidationMiddleware';
import { PTPlansRequestDTO } from '@/domain/dtos/pTPlanRequestDTO';
import { IResponseDTO } from '@/domain/dtos/response.dto';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { IGetPTPlansResponseDTO } from '@/domain/dtos/getPTPlansResponse.dto';
import { CustomRequest } from '@/types/customRequest';
import { UserPTPlansRequestDTO } from '@/domain/dtos/user/userPTPlanRequestDTO';
import { CreateUserRequestDTO } from '@/domain/dtos/user/createUserRequest.dto';
import { LogoutRequestDTO } from '@/domain/dtos/user/logoutRequest.dto';
import { ResetPasswordRequestDTO } from '@/domain/dtos/user/resetPasswordRequest.dto';
import { VerifyOtpRequestDTO } from '@/domain/dtos/user/verifyOtpRequest.dto';
import { ForgotPasswordRequestDTO } from '@/domain/dtos/user/forgotPasswordRequest.dto';
import { ResendOtpRequestDTO } from '@/domain/dtos/user/resendOtpRequest.dto';
import { GoogleAuthRequestDTO } from '@/domain/dtos/user/googleAuthRequest.dto';
import { LoginRequestDTO } from '@/domain/dtos/user/loginRequest.dto';
import { MarkNotificationReadRequestDTO } from '@/domain/dtos/user/markNotificationReadRequest.dto';
import { VerifyMembershipPaymentRequestDTO } from '@/domain/dtos/user/verifyMembershipPaymentRequest.dto';
import { InitiateMembershipPaymentRequestDTO } from '@/domain/dtos/user/initiateMembershipPaymentRequest.dto';
import { UpdateUserProfileRequestDTO } from '@/domain/dtos/user/updateUserProfileRequest.dto';
import { RefreshTokenRequestDTO } from '@/domain/dtos/user/refreshTokenRequest.dto';

export class UserValidationMiddleware implements IUserValidationMiddleware {
  private sendResponse<T>(res: Response, result: IResponseDTO<T>): void {
    res.status(result.status).json({
      success: result.success,
      message: result.message,
      ...(result.success ? { data: result.data } : { error: result.error }),
    });
  }

  async validateGetPTPlans(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // if (!req.user?.id) {
      //   throw new Error(ERRORMESSAGES.AUTH_USER_NOT_AUTHENTICATED.message);
      // }

      const ptPlansRequestDTO = new UserPTPlansRequestDTO({
        page: req.query.page?.toString() || '1',
        limit: req.query.limit?.toString() || '10',
        category: req.query.category?.toString() || 'all',
        minPrice: req.query.minPrice?.toString(),
        maxPrice: req.query.maxPrice?.toString(),
      });

      req.validatedData = ptPlansRequestDTO;
      next();
    } catch (error: any) {
      console.error('[ERROR] User middleware-validation error: from validateGetPTPlans', error);
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
      this.sendResponse(res, response);
    }
  }

  // Placeholder implementations for other methods

 async validateSignup(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const createUserRequestDTO = new CreateUserRequestDTO(req.body);
      req.validatedData = createUserRequestDTO;
      next();
    } catch (error: any) {
      console.error('[ERROR] User middleware-validation error: from validateSignup', error);
      const response: IResponseDTO<null> = {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: ERRORMESSAGES.USER_INVALID_NAME.message,
        error: {
          code: error.message.includes('USER_') ? error.message : ERRORMESSAGES.GENERIC_ERROR.code,
          message: error.message || ERRORMESSAGES.USER_INVALID_NAME.message,
        },
      };
      this.sendResponse(res, response);
    }
  }

  async validateLogin(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const loginRequestDTO = new LoginRequestDTO(req.body);
      req.validatedData = loginRequestDTO;
      next();
    } catch (error: any) {
      console.error('[ERROR] User middleware-validation error: from validateLogin', error);
      const response: IResponseDTO<null> = {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: ERRORMESSAGES.USER_INVALID_EMAIL.message,
        error: {
          code: error.message.includes('USER_') ? error.message : ERRORMESSAGES.GENERIC_ERROR.code,
          message: error.message || ERRORMESSAGES.USER_INVALID_EMAIL.message,
        },
      };
      this.sendResponse(res, response);
    }
  }

  async validateGoogleAuth(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const googleAuthRequestDTO = new GoogleAuthRequestDTO(req.body);
      req.validatedData = googleAuthRequestDTO;
      next();
    } catch (error: any) {
      console.error('[ERROR] User middleware-validation error: from validateGoogleAuth', error);
      const response: IResponseDTO<null> = {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: ERRORMESSAGES.USER_INVALID_GOOGLE_TOKEN.message,
        error: {
          code: error.message.includes('USER_') || error.message.includes('GOOGLE_AUTH_') ? error.message : ERRORMESSAGES.GENERIC_ERROR.code,
          message: error.message || ERRORMESSAGES.GOOGLE_AUTH_GOOGLE_AUTH_FAILED.message,
        },
      };
      this.sendResponse(res, response);
    }
  }

  async validateResendOtp(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const resendOtpRequestDTO = new ResendOtpRequestDTO(req.body);
      req.validatedData = resendOtpRequestDTO;
      next();
    } catch (error: any) {
      console.error('[ERROR] User middleware-validation error: from validateResendOtp', error);
      const response: IResponseDTO<null> = {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: ERRORMESSAGES.USER_INVALID_EMAIL.message,
        error: {
          code: error.message.includes('USER_') ? error.message : ERRORMESSAGES.GENERIC_ERROR.code,
          message: error.message || ERRORMESSAGES.USER_INVALID_EMAIL.message,
        },
      };
      this.sendResponse(res, response);
    }
  }

  async validateForgotPassword(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const forgotPasswordRequestDTO = new ForgotPasswordRequestDTO(req.body);
      req.validatedData = forgotPasswordRequestDTO;
      next();
    } catch (error: any) {
      console.error('[ERROR] User middleware-validation error: from validateForgotPassword', error);
      const response: IResponseDTO<null> = {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: ERRORMESSAGES.USER_INVALID_EMAIL.message,
        error: {
          code: error.message.includes('USER_') ? error.message : ERRORMESSAGES.GENERIC_ERROR.code,
          message: error.message || ERRORMESSAGES.USER_INVALID_EMAIL.message,
        },
      };
      this.sendResponse(res, response);
    }
  }

  async validateVerifyOtp(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const verifyOtpRequestDTO = new VerifyOtpRequestDTO(req.body);
      req.validatedData = verifyOtpRequestDTO;
      next();
    } catch (error: any) {
      console.error('[ERROR] User middleware-validation error: from validateVerifyOtp', error);
      const response: IResponseDTO<null> = {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: ERRORMESSAGES.USER_INVALID_OTP.message,
        error: {
          code: error.message.includes('USER_') ? error.message : ERRORMESSAGES.GENERIC_ERROR.code,
          message: error.message || ERRORMESSAGES.USER_INVALID_OTP.message,
        },
      };
      this.sendResponse(res, response);
    }
  }

  async validateResetPassword(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const resetPasswordRequestDTO = new ResetPasswordRequestDTO(req.body);
      req.validatedData = resetPasswordRequestDTO;
      next();
    } catch (error: any) {
      console.error('[ERROR] User middleware-validation error: from validateResetPassword', error);
      const response: IResponseDTO<null> = {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: ERRORMESSAGES.USER_INVALID_PASSWORD.message,
        error: {
          code: error.message.includes('USER_') ? error.message : ERRORMESSAGES.GENERIC_ERROR.code,
          message: error.message || ERRORMESSAGES.USER_INVALID_PASSWORD.message,
        },
      };
      this.sendResponse(res, response);
    }
  }

  async validateLogout(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const logoutRequestDTO = new LogoutRequestDTO(req.body);
      req.validatedData = logoutRequestDTO;
      next();
    } catch (error: any) {
      console.error('[ERROR] User middleware-validation error: from validateLogout', error);
      const response: IResponseDTO<null> = {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: ERRORMESSAGES.USER_INVALID_EMAIL.message,
        error: {
          code: error.message.includes('USER_') ? error.message : ERRORMESSAGES.GENERIC_ERROR.code,
          message: error.message || ERRORMESSAGES.USER_INVALID_EMAIL.message,
        },
      };
      this.sendResponse(res, response);
    }
  }

 


  async validateRefreshToken(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new Error(ERRORMESSAGES.USER_NOT_AUTHENTICATED.message);
      }
      const refreshToken = req.cookies?.userRefreshToken;
      const refreshTokenRequestDTO = new RefreshTokenRequestDTO({ refreshToken });
      req.validatedData = refreshTokenRequestDTO;
      next();
    } catch (error: any) {
      console.error('[ERROR] User middleware-validation error: from validateRefreshToken', error);
      const response: IResponseDTO<null> = {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: ERRORMESSAGES.AUTH_MISSING_REFRESH_TOKEN.message,
        error: {
          code: error.message.includes('USER_') || error.message.includes('AUTH_') ? error.message : ERRORMESSAGES.GENERIC_ERROR.code,
          message: error.message || ERRORMESSAGES.AUTH_MISSING_REFRESH_TOKEN.message,
        },
      };
      this.sendResponse(res, response);
    }
  }

  async validateUpdateUserProfile(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new Error(ERRORMESSAGES.USER_NOT_AUTHENTICATED.message);
      }
      const updateUserProfileRequestDTO = new UpdateUserProfileRequestDTO({
        name: req.body.name,
        profilePic: '',
      });
      req.validatedData = updateUserProfileRequestDTO;
      next();
    } catch (error: any) {
      console.error('[ERROR] User middleware-validation error: from validateUpdateUserProfile', error);
      const response: IResponseDTO<null> = {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: ERRORMESSAGES.USER_INVALID_PROFILE_PIC.message,
        error: {
          code: error.message.includes('USER_') ? error.message : ERRORMESSAGES.GENERIC_ERROR.code,
          message: error.message || ERRORMESSAGES.USER_INVALID_PROFILE_PIC.message,
        },
      };
      this.sendResponse(res, response);
    }
  }

  async validateInitiateMembershipPayment(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new Error(ERRORMESSAGES.USER_NOT_AUTHENTICATED.message);
      }
      const initiateMembershipPaymentRequestDTO = new InitiateMembershipPaymentRequestDTO(req.body);
      req.validatedData = initiateMembershipPaymentRequestDTO;
      next();
    } catch (error: any) {
      console.error('[ERROR] User middleware-validation error: from validateInitiateMembershipPayment', error);
      const response: IResponseDTO<null> = {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: ERRORMESSAGES.USER_INVALID_PLAN_ID.message,
        error: {
          code: error.message.includes('MEMBERSHIP_') ? error.message : ERRORMESSAGES.GENERIC_ERROR.code,
          message: error.message || ERRORMESSAGES.USER_INVALID_PLAN_ID.message,
        },
      };
      this.sendResponse(res, response);
    }
  }

  async validateVerifyMembershipPayment(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new Error(ERRORMESSAGES.USER_NOT_AUTHENTICATED.message);
      }
      const verifyMembershipPaymentRequestDTO = new VerifyMembershipPaymentRequestDTO(req.body);
      req.validatedData = verifyMembershipPaymentRequestDTO;
      next();
    } catch (error: any) {
      console.error('[ERROR] User middleware-validation error: from validateVerifyMembershipPayment', error);
      const response: IResponseDTO<null> = {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: ERRORMESSAGES.USER_INVALID_PAYMENT_ID.message,
        error: {
          code: error.message.includes('PAYMENT_') ? error.message : ERRORMESSAGES.GENERIC_ERROR.code,
          message: error.message || ERRORMESSAGES.USER_INVALID_PAYMENT_ID.message,
        },
      };
      this.sendResponse(res, response);
    }
  }

  async validateMarkNotificationRead(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new Error(ERRORMESSAGES.USER_NOT_AUTHENTICATED.message);
      }
      const markNotificationReadRequestDTO = new MarkNotificationReadRequestDTO({
        notificationId: req.params.notificationId,
      });
      req.validatedData = markNotificationReadRequestDTO;
      next();
    } catch (error: any) {
      console.error('[ERROR] User middleware-validation error: from validateMarkNotificationRead', error);
      const response: IResponseDTO<null> = {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: ERRORMESSAGES.NOTIFICATION_INVALID_ID.message,
        error: {
          code: error.message.includes('NOTIFICATION_') ? error.message : ERRORMESSAGES.GENERIC_ERROR.code,
          message: error.message || ERRORMESSAGES.NOTIFICATION_INVALID_ID.message,
        },
      };
      this.sendResponse(res, response);
    }
  }
}