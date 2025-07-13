import { Gym } from '../entities/Gym.entity';

export interface IGetAdminGymsResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  data?: {
    gyms: Gym[];
    total: number;
    totalPages: number;
  };
  error?: { code: string; message: string };
}