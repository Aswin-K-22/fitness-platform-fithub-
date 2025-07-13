import { Gym } from '../entities/Gym.entity';

export interface AddGymResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  data?: { gym: ReturnType<Gym['toJSON']> };
  error?: { code: string; message: string };
}