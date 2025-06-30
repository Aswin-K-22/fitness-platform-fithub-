// backend/src/domain/dtos/loginResponse.dto.ts
import { UserAuthResponseDTO } from './userAuthResponse.dto';

export interface LoginResponseDTO {
  success: boolean;
  data?: {
    user: UserAuthResponseDTO;
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
}