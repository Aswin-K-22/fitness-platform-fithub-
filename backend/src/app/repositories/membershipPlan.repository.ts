import { MembershipPlan} from '@/domain/entities/MembershipPlan.entity';

export interface IMembershipsPlanRepository {
  findAllPlans(skip: number, take: number): Promise<MembershipPlan[]>;
  countPlans(): Promise<number>;
  findPlanById(id: string): Promise<MembershipPlan | null>;
}