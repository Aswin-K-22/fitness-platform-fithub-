// src/app/repositories/membershipPlan.repository.ts
import { MembershipPlan } from '@/domain/entities/MembershipPlan.entity';

export interface IMembershipsPlanRepository {
  findByName(name: string): Promise<MembershipPlan | null>;
  createPlan(data: MembershipPlan): Promise<MembershipPlan>;
  findAllPlans(skip: number, take: number): Promise<MembershipPlan[]>;
  countPlans(): Promise<number>;
  findPlanById(id: string): Promise<MembershipPlan | null>;
}