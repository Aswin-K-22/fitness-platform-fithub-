import { IUpdateUserProfileRequestDTO } from '@/domain/dtos/updateUserProfileRequest.dto';
import { User } from '../../domain/entities/User.entity';

export interface IUsersRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: User): Promise<User>;
  updateOtp(email: string, otp: string): Promise<void>;
  updateRefreshToken(email: string, refreshToken: string | null): Promise<void>;
  verifyUser(email: string): Promise<void>;
  updatePassword(email: string, newPassword: string): Promise<void>;
  createWithOtp(user: User,otp: string): Promise<User>;
  updateMembership(userId: string, membershipId: string): Promise<void> 
  updateProfile(email: string, data: IUpdateUserProfileRequestDTO): Promise<User>;
}