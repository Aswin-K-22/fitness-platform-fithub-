import { TrainerResponseDTO } from './getTrainersResponse.dto';

export interface IApproveTrainerResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  data?: { trainer: TrainerResponseDTO };
  error?: { code: string; message: string };
}


