// backend/src/infra/repositories/membershipsPlan.repository.ts
import { PrismaClient } from '@prisma/client';
import { MembershipPlan } from '@/domain/entities/MembershipPlan.entity';
import { IMembershipsPlanRepository } from '@/app/repositories/membershipPlan.repository';
import { BaseRepository } from './base.repository';

export class MembershipsPlanRepository
  extends BaseRepository<MembershipPlan>
  implements IMembershipsPlanRepository
{
  constructor(prisma: PrismaClient) {
    super(prisma, 'membershipPlan');
  }

  protected toDomain(record: any): MembershipPlan {
    return new MembershipPlan({
      id: record.id,
      name: record.name,
      type: record.type,
      description: record.description,
      price: record.price,
      duration: record.duration,
      features: record.features,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async findByName(name: string): Promise<MembershipPlan | null> {
    const plan = await this.prisma.membershipPlan.findUnique({ where: { name } });
    return plan ? this.toDomain(plan) : null;
  }
}