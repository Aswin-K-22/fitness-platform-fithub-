//src/app/repositories/ptPlan.repository.ts
import { IBaseRepository } from './base.repository';
import { PTPlan } from '@/domain/entities/PTPlan.entity';

export interface IPTPlanRepository extends IBaseRepository<PTPlan, string> {
  findByTrainerId(trainerId: string, skip: number, take: number): Promise<PTPlan[]>;
  countByTrainerId(trainerId: string): Promise<number> ;
  stop(id: string): Promise<void>;
  resume(id: string): Promise<void>;
}