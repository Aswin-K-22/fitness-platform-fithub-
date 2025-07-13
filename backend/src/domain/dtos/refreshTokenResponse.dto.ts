import { UserAuthResponseDTO } from './userAuthResponse.dto';

export interface IRefreshTokenResponseDTO {
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