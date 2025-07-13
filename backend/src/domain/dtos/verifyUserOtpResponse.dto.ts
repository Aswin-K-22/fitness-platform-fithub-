import { UserAuthResponseDTO } from '../../domain/dtos/userAuthResponse.dto';

export interface IVerifyUserOtpResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  data?: {
    user: UserAuthResponseDTO;
    accessToken: string;
    refreshToken: string;
  };
  error?: { code: string; message: string };
}