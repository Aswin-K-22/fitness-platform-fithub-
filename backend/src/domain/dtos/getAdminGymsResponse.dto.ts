import { Gym } from '../entities/Gym.entity';

export interface GetAdminGymsResponseDTO {
  gyms: Gym[];
  total: number;
  totalPages: number;
}