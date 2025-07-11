// backend/src/app/repositories/trainers.repository.ts
import { IUpdateTrainerProfileRequestDTO } from '@/domain/enums/updateTrainerProfileRequest.dto';
import { Trainer } from '../../domain/entities/Trainer.entity';

export interface ITrainersRepository {
  findByEmail(email: string): Promise<Trainer | null>;
  findById(id: string): Promise<Trainer | null>;
  signupTrainer(trainer: Trainer): Promise<Trainer>;
  updateOtp(email: string, otp: string): Promise<void>;
  verifyTrainer(email: string): Promise<void>;
  updateRefreshToken(email: string, refreshToken: string | null): Promise<void>;
  findAll(
    skip: number,
    take: number,
    search?: string,
    status?: string,
    specialization?: string,
  ): Promise<Trainer[]>;
    findAvailableTrainers(): Promise<{ id: string; name: string; active: boolean }[]>;
  checkTrainerAvailability(trainerIds: string[]): Promise<{ isValid: boolean; message?: string }>;
  assignTrainersToGym(trainerIds: string[], gymId: string): Promise<void>;
  toggleApproval(trainerId: string, verifiedByAdmin: boolean): Promise<Trainer>;
  count(search?: string, status?: string, specialization?: string): Promise<number>;
  countPending(): Promise<number>;
  countApproved(): Promise<number>;
  countSuspended(): Promise<number>;
  toggleApproval(trainerId: string, verifiedByAdmin: boolean): Promise<Trainer>;
  updateProfile(email: string, data: IUpdateTrainerProfileRequestDTO): Promise<Trainer>;
}