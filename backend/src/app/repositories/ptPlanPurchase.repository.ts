// src/app/repositories/ptPlanPurchase.repository.ts

import { IBaseRepository } from './base.repository';
import { PTPlanPurchase } from '@/domain/entities/PTPlanPurchase.entity';

export interface IPTPlanPurchasesRepository extends IBaseRepository<PTPlanPurchase, string> {
  findActiveByUser(userId: string): Promise<PTPlanPurchase[]>;
  findByUserAndPlan(userId: string, ptPlanId: string): Promise<PTPlanPurchase | null>;
  findAllByUser(userId: string, skip: number, take: number): Promise<PTPlanPurchase[]>;
  countByUser(userId: string): Promise<number>;
  findActiveByUser(userId: string): Promise<PTPlanPurchase[]>;
   findByTrainerId(trainerId: string): Promise<PTPlanPurchase[]>;

}
