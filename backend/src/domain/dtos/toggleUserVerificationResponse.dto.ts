import { UserAuthResponseDTO } from './userAuthResponse.dto';

export interface IToggleUserVerificationResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  data?: { user: UserAuthResponseDTO };
  error?: { code: string; message: string };
}