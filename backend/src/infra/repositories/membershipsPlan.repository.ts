// src/infra/repositories/membershipsPlan.repository.ts
import { PrismaClient } from '@prisma/client';
import { MembershipPlan } from '@/domain/entities/MembershipPlan.entity';
import { IMembershipsPlanRepository } from '@/app/repositories/membershipPlan.repository';
import { MembershipErrorType } from '@/domain/enums/membershipErrorType.enum';

export class MembershipsPlanRepository implements IMembershipsPlanRepository {
  constructor(private prisma: PrismaClient) {}

  async findByName(name: string): Promise<MembershipPlan | null> {
    try {
      const plan = await this.prisma.membershipPlan.findUnique({
        where: { name },
        select: {
          id: true,
          name: true,
          type: true,
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
        type: plan.type,
        description: plan.description,
        price: plan.price,
        duration: plan.duration,
        features: plan.features,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      });
    } catch (error) {
      throw new Error(MembershipErrorType.DatabaseError);
    }
  }

  async createPlan(data: MembershipPlan): Promise<MembershipPlan> {
    try {
      const newPlan = await this.prisma.membershipPlan.create({
        data: {
          name: data.name,
          type: data.type,
          description: data.description,
          price: data.price,
          duration: data.duration,
          features: data.features,
        },
      });

      return new MembershipPlan({
        id: newPlan.id,
        name: newPlan.name,
        type: newPlan.type,
        description: newPlan.description,
        price: newPlan.price,
        duration: newPlan.duration,
        features: newPlan.features,
        createdAt: newPlan.createdAt,
        updatedAt: newPlan.updatedAt,
      });
    } catch (error) {
      throw new Error(MembershipErrorType.DatabaseError);
    }
  }

  async findAllPlans(skip: number, take: number): Promise<MembershipPlan[]> {
    try {
      if (skip < 0 || take <= 0) {
        throw new Error(MembershipErrorType.InvalidPagination);
      }

      const plans = await this.prisma.membershipPlan.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          type: true,
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
            type: plan.type,
            description: plan.description,
            price: plan.price,
            duration: plan.duration,
            features: plan.features,
            createdAt: plan.createdAt,
            updatedAt: plan.updatedAt,
          })
      );
    } catch (error) {
      throw new Error(MembershipErrorType.DatabaseError);
    }
  }

  async countPlans(): Promise<number> {
    try {
      return await this.prisma.membershipPlan.count();
    } catch (error) {
      throw new Error(MembershipErrorType.DatabaseError);
    }
  }

  async findPlanById(id: string): Promise<MembershipPlan | null> {
    try {
      const plan = await this.prisma.membershipPlan.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          type: true,
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
        type: plan.type,
        description: plan.description,
        price: plan.price,
        duration: plan.duration,
        features: plan.features,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      });
    } catch (error) {
      throw new Error(MembershipErrorType.DatabaseError);
    }
  }
}