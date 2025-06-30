// backend/src/app/repositories/trainers.repository.ts
import { Trainer } from '../../domain/entities/Trainer.entity';

export interface ITrainersRepository {
  findByEmail(email: string): Promise<Trainer | null>;
  findById(id: string): Promise<Trainer | null>;
  signupTrainer(trainer: Trainer): Promise<Trainer>;
  updateOtp(email: string, otp: string): Promise<void>;
  verifyTrainer(email: string): Promise<void>;
  updateRefreshToken(email: string, refreshToken: string | null): Promise<void>;
}