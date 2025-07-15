// backend/src/app/repositories/membershipPlan.repository.ts
import { IBaseRepository } from './base.repository';
import { MembershipPlan } from '@/domain/entities/MembershipPlan.entity';

export interface IMembershipsPlanRepository extends IBaseRepository<MembershipPlan> {
  findByName(name: string): Promise<MembershipPlan | null>;
}