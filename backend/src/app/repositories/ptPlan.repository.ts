//src/app/repositories/ptPlan.repository.ts
import { PTPlanFilter } from '@/domain/types/ptPlanFilter';
import { IBaseRepository } from './base.repository';
import { PTPlan } from '@/domain/entities/PTPlan.entity';

export interface IPTPlanRepository extends IBaseRepository<PTPlan, string> {
  findByTrainerId(trainerId: string, skip: number, take: number): Promise<PTPlan[]>;
  countByTrainerId(trainerId: string): Promise<number> ;
  stop(id: string): Promise<void>;
  resume(id: string): Promise<void>;
findAllByAdminVerification(skip: number, take: number, verifiedByAdmin?: boolean): Promise<PTPlan[]>;
  countByAdminVerification(verifiedByAdmin?: boolean): Promise<number>;
  adminVerifyPTPlan(id: string, verifiedByAdmin: boolean): Promise<PTPlan>;
  updateAdminPrice(id: string, adminPrice: number, totalPrice: number): Promise<PTPlan>;
  findForUsers(filters: PTPlanFilter, skip: number, take: number): Promise<PTPlan[]>;
  countForUsers(filters: PTPlanFilter): Promise<number>;
}