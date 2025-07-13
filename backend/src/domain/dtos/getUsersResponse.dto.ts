import { User } from '../../domain/entities/User.entity';

export interface IGetUsersResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  data?: { users: User[]; totalPages: number; totalUsers: number };
  error?: { code: string; message: string };
}