// backend/src/app/repositories/users.repository.ts
import { User } from '@/domain/entities/User.entity';
import { IBaseRepository } from './base.repository';
import { IUpdateUserProfileRequestDTO } from '@/domain/dtos/updateUserProfileRequest.dto';
import { IGetUsersRequestDTO } from '@/domain/dtos/getUsersRequest.dto';

export interface IUsersRepository extends IBaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  createWithOtp(user: User, otp: string): Promise<User>;
  updateOtp(email: string, otp: string): Promise<void>;
  verifyUser(email: string): Promise<void>;
  updateRefreshToken(email: string, refreshToken: string | null): Promise<void>;
  updatePassword(email: string, newPassword: string): Promise<void>;
  updateMembership(userId: string, membershipId: string): Promise<void>;
  updateProfile(email: string, data: IUpdateUserProfileRequestDTO): Promise<User>;
  findAllUsers(params: IGetUsersRequestDTO): Promise<User[]>;
  countUsers(params: IGetUsersRequestDTO): Promise<number>;
  toggleUserVerification(userId: string): Promise<User>;
}