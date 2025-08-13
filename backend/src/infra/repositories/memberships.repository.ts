// backend/src/infra/repositories/memberships.repository.ts
import { PrismaClient } from '@prisma/client';
import { Membership } from '@/domain/entities/Membership.entity';
import { IMembershipsRepository } from '@/app/repositories/memberships.repository';
import { BaseRepository } from './base.repository';

export class MembershipsRepository
  extends BaseRepository<Membership>
  implements IMembershipsRepository
{
  constructor(prisma: PrismaClient) {
    super(prisma, 'membership');
  }

  protected toDomain(record: any): Membership {
    return new Membership({
      id: record.id,
      userId: record.userId,
      planId: record.planId,
      status: record.status,
      startDate: record.startDate,
      endDate: record.endDate,
      paymentId: record.paymentId,
      price: record.price,
      currency: record.currency,
      paymentStatus: record.paymentStatus,
      paymentDate: record.paymentDate,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

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
    const membership = await this.prisma.membership.create({ data });
    return this.toDomain(membership);
  }


async getCurrentPlansByUserId(userId: string): Promise<Membership[]> {
 const today = new Date();

  const records = await this.prisma.membership.findMany({
    where: {
      userId,
      status: 'Active',
      paymentStatus: 'Paid',
      endDate: { gte: today } 
    }
  });

  return records.map(record => new Membership({
    id: record.id,
    userId: record.userId,
    planId: record.planId,
    status: record.status,
    startDate: record.startDate,
    endDate: record.endDate,
    paymentId: record.paymentId,
    price: record.price,
    currency: record.currency,
    paymentStatus: record.paymentStatus,
    paymentDate: record.paymentDate,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  }));
}

}