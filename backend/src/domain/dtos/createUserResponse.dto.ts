import { User } from '../../domain/entities/User.entity';

export interface ICreateUserResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  data?: { user: User };
  error?: { code: string; message: string };
}