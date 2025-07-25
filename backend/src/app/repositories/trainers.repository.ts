// backend/src/app/repositories/trainers.repository.ts
import { IBaseRepository } from './base.repository';
import { Trainer } from '@/domain/entities/Trainer.entity';
import { IUpdateTrainerProfileRequestDTO } from '@/domain/dtos/updateTrainerProfileRequest.dto';
import { IUpdateTrainerProfileUseCaseDTO } from '@/domain/dtos/updateTrainerProfileResponse.dto';

export interface ITrainersRepository extends IBaseRepository<Trainer> {
  findByEmail(email: string): Promise<Trainer | null>;
  updateOtp(email: string, otp: string): Promise<void>;
  signupTrainer(trainer: Trainer): Promise<Trainer>;
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
updateProfile(trainerId: string, data: IUpdateTrainerProfileUseCaseDTO): Promise<Trainer>;
}