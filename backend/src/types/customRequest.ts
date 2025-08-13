// src/types/customRequest.ts
import { Request } from 'express';
import { AdminPTPlansRequestDTO } from '../domain/dtos/adminPTPlansRequestDTO';
import { CreatePTPlanRequestDTO } from '@/domain/dtos/createPTPlanRequest.dto';
import { ResumePTPlanRequestDTO, StopPTPlanRequestDTO } from '@/domain/dtos/stopResumePTPlanRequest.dto';
import { UpdateTrainerProfileRequestDTO } from '@/domain/dtos/updateTrainerProfileResponse.dto';
import { PTPlansRequestDTO } from '@/domain/dtos/pTPlanRequestDTO';
import { EditPTPlanRequestDTO } from '@/domain/dtos/editPTPlanRequest.dto';
import { VerifyPTPlanRequestDTO } from '@/domain/dtos/verifyPTPlanRequestDTO';
import { UpdateAdminPriceRequestDTO } from '@/domain/dtos/updateAdminPriceRequestDTO';
import { AdminTrainersRequestDTO } from '@/domain/dtos/admin/adminTrainersRequestDTO';
import { CreateUserRequestDTO } from '@/domain/dtos/user/createUserRequest.dto';
import { LoginRequestDTO } from '@/domain/dtos/user/loginRequest.dto';
import { GoogleAuthRequestDTO } from '@/domain/dtos/user/googleAuthRequest.dto';
import { ResendOtpRequestDTO } from '@/domain/dtos/user/resendOtpRequest.dto';
import { ForgotPasswordRequestDTO } from '@/domain/dtos/user/forgotPasswordRequest.dto';
import { VerifyOtpRequestDTO } from '@/domain/dtos/user/verifyOtpRequest.dto';
import { ResetPasswordRequestDTO } from '@/domain/dtos/user/resetPasswordRequest.dto';
import { LogoutRequestDTO } from '@/domain/dtos/user/logoutRequest.dto';
import { RefreshTokenRequestDTO } from '@/domain/dtos/user/refreshTokenRequest.dto';
import { MarkNotificationReadRequestDTO } from '@/domain/dtos/user/markNotificationReadRequest.dto';
import { VerifyMembershipPaymentRequestDTO } from '@/domain/dtos/user/verifyMembershipPaymentRequest.dto';
import { UpdateUserProfileRequestDTO } from '@/domain/dtos/user/updateUserProfileRequest.dto';
import { InitiateMembershipPaymentRequestDTO } from '@/domain/dtos/user/initiateMembershipPaymentRequest.dto';
import { UserPTPlansRequestDTO } from '@/domain/dtos/user/userPTPlanRequestDTO';

export interface CustomRequest extends Request {
  validatedData?:
    | CreatePTPlanRequestDTO
    | StopPTPlanRequestDTO
    | ResumePTPlanRequestDTO
    | UpdateTrainerProfileRequestDTO
    | AdminPTPlansRequestDTO
    | VerifyPTPlanRequestDTO
    |  UpdateAdminPriceRequestDTO
    | AdminTrainersRequestDTO
    | CreateUserRequestDTO
    | LoginRequestDTO
    | GoogleAuthRequestDTO
    | ResendOtpRequestDTO
    | ForgotPasswordRequestDTO
    | VerifyOtpRequestDTO
    | ResetPasswordRequestDTO
    | LogoutRequestDTO
    | RefreshTokenRequestDTO
    | UpdateUserProfileRequestDTO
    | InitiateMembershipPaymentRequestDTO
    | VerifyMembershipPaymentRequestDTO
    | MarkNotificationReadRequestDTO
    | UserPTPlansRequestDTO
    | undefined;
  PTPlansGetRequestDTO?: PTPlansRequestDTO;
  editPTPlanRequestDTO?: EditPTPlanRequestDTO;
  trainer?: { id: string | null; email: string };
}