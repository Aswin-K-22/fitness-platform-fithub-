import { User } from '../entities/User.entity';

export interface IGetUsersResponseDTO {
  users: User[];
  totalPages: number;
  totalUsers: number;
}