// backend/src/infra/repositories/ptPlanPurchases.repository.ts

import { PrismaClient } from '@prisma/client';
import { PTPlanPurchase } from '@/domain/entities/PTPlanPurchase.entity';
import { IPTPlanPurchasesRepository } from '@/app/repositories/ptPlanPurchase.repository';
import { BaseRepository } from './base.repository';

export class PTPlanPurchasesRepository
  extends BaseRepository<PTPlanPurchase>
  implements IPTPlanPurchasesRepository
{
  constructor(prisma: PrismaClient) {
    super(prisma, 'pTPlanPurchase'); 
  }

  protected toDomain(record: any): PTPlanPurchase {
    return new PTPlanPurchase({
      id: record.id,
      userId: record.userId,
      ptPlanId: record.ptPlanId,
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

  async findActiveByUser(userId: string): Promise<PTPlanPurchase[]> {
      const today = new Date();
    const records = await this.prisma.pTPlanPurchase.findMany({
     where: {
      userId,
      status: 'Active',
      startDate: { lte: today }, 
      endDate: { gte: today },     
    },
    });
    return records.map(this.toDomain);
  }

  async findByUserAndPlan(
    userId: string,
    ptPlanId: string
  ): Promise<PTPlanPurchase | null> {
    const record = await this.prisma.pTPlanPurchase.findFirst({
      where: {
        userId,
        ptPlanId,
      },
    });
    return record ? this.toDomain(record) : null;
  }

  async findAllByUser(
    userId: string,
    skip: number,
    take: number
  ): Promise<PTPlanPurchase[]> {
    const records = await this.prisma.pTPlanPurchase.findMany({
      where: {
        userId,
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
    return records.map(this.toDomain);
  }

  async countByUser(userId: string): Promise<number> {
    return await this.prisma.pTPlanPurchase.count({
      where: {
        userId,
      },
    });
  }

  
}
