import { PrismaClient } from '@prisma/client';
import { MembershipPlan } from '@/domain/entities/MembershipPlan.entity';
import { IMembershipsPlanRepository } from '@/app/repositories/membershipPlan.repository';

export class MembershipsPlanRepository implements IMembershipsPlanRepository {
  constructor(private prisma: PrismaClient) {}

  async findAllPlans(skip: number, take: number): Promise<MembershipPlan[]> {
    const plans = await this.prisma.membershipPlan.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        duration: true,
        features: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return plans.map(
      (plan) =>
        new MembershipPlan({
          id: plan.id,
          name: plan.name,
          description: plan.description || '', 
          price: plan.price,
          duration: plan.duration,
          features: plan.features || [],
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        })
    );
  }

  async countPlans(): Promise<number> {
    return this.prisma.membershipPlan.count();
  }
  async findPlanById(id: string): Promise<MembershipPlan | null> {
    const plan = await this.prisma.membershipPlan.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        duration: true,
        features: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!plan) {
    return null;
  }

    return new MembershipPlan({
          id: plan.id,
          name: plan.name,
          description: plan.description, 
          price: plan.price,
          duration: plan.duration,
          features: plan.features || [],
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        })
  }
}