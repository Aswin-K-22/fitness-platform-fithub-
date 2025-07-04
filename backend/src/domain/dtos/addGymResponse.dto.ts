import { Gym } from '../entities/Gym.entity';

export interface AddGymResponseDTO {
  success: boolean;
  gym: ReturnType<Gym['toJSON']>;
  message: string;
}