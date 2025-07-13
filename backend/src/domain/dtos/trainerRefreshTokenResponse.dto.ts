import { TrainerAuth } from './getTrainerResponse.dto';

export interface ITrainerRefreshTokenResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  data?: {
    trainer: TrainerAuth;
    accessToken: string;
    refreshToken: string;
  };
  error?: { code: string; message: string };
}