import { PrismaClient } from '@prisma/client';
import { Membership } from '@/domain/entities/Membership.entity';
import { IMembershipsRepository } from '@/app/repositories/memberships.repository';

interface MembershipPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class MembershipsRepository implements IMembershipsRepository {
  constructor(private prisma: PrismaClient) {}



  async createMembership(data: {
    userId: string;
    planId: string;
    status: string;
    startDate: Date;
    endDate: Date;
    paymentId: string;
    price: number;
    currency: string;
    paymentStatus: string;
    paymentDate: Date;
  }): Promise<Membership> {
    const membership = await this.prisma.membership.create({
      data: {
        userId: data.userId,
        planId: data.planId,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate,
        paymentId: data.paymentId,
        price: data.price,
        currency: data.currency,
        paymentStatus: data.paymentStatus,
        paymentDate: data.paymentDate,
      },
    });
    return new Membership({
      id: membership.id,
      userId: membership.userId,
      planId: membership.planId,
      status: membership.status,
      startDate: membership.startDate,
      endDate: membership.endDate,
      paymentId: membership.paymentId,
      price: membership.price,
      currency: membership.currency,
      paymentStatus: membership.paymentStatus,
      paymentDate: membership.paymentDate,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    });
  }

  // Existing methods (e.g., findAllPlans, countPlans) remain unchanged
}