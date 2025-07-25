import { PrismaClient } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { PTPlan } from '@/domain/entities/PTPlan.entity';
import { IPTPlanRequestToEntity } from '@/domain/dtos/createPTPlanRequest.dto';
import { IPTPlanRepository } from '@/app/repositories/ptPlan.repository';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';

export class PTPlanRepository extends BaseRepository<PTPlan, string> implements IPTPlanRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, 'pTPlan');
  }

  protected toDomain(record: any): PTPlan {
    return new PTPlan({
      id: record.id,
      title: record.title,
      category: record.category,
      mode: record.mode,
      description: record.description,
      goal: record.goal,
      features: record.features,
      duration: record.duration,
      image: record.image,
      trainerPrice: record.trainerPrice,
      adminPrice: record.adminPrice,
      totalPrice: record.totalPrice,
      verifiedByAdmin: record.verifiedByAdmin,
      createdBy: record.createdBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      isActive: record.isActive,
    });
  }

  async findByTrainerId(trainerId: string, skip: number, take: number): Promise<PTPlan[]> {
    const records = await this.prisma.pTPlan.findMany({
      where: { createdBy: trainerId },
      skip,
      take,
      orderBy: { createdAt: 'desc' }, 
    });
    return records.map(this.toDomain);
  }

  async countByTrainerId(trainerId: string): Promise<number> {
    return this.prisma.pTPlan.count({
      where: { createdBy: trainerId },
    });
  }

  
async update(id: string, data: Partial<IPTPlanRequestToEntity>): Promise<PTPlan> {
    const record = await this.prisma.pTPlan.update({
      where: { id },
      data: {
        title: data.title,
        category: data.category,
        mode: data.mode,
        description: data.description,
        goal: data.goal,
        features: data.features,
        duration: data.duration,
        image: data.image,
        trainerPrice: data.trainerPrice,
        verifiedByAdmin: false, 
        updatedAt: new Date(),
      },
    });
    return this.toDomain(record);
  }

 async stop(id: string): Promise<void> {
    const record = await this.prisma.pTPlan.update({
      where: { id },
      data: { isActive: false, updatedAt: new Date() },
    });
    if (!record) {
      throw new Error(ERRORMESSAGES.PTPLAN_NOT_FOUND.message);
    }
  }

  async resume(id: string): Promise<void> {
    const record = await this.prisma.pTPlan.update({
      where: { id },
      data: { isActive: true, updatedAt: new Date() },
    });
    if (!record) {
      throw new Error(ERRORMESSAGES.PTPLAN_NOT_FOUND.message);
    }
  }

  async findAllByAdminVerification(skip: number, take: number, verifiedByAdmin?: boolean): Promise<PTPlan[]> {
    const where: any = {};
    if (verifiedByAdmin !== undefined) {
      where.verifiedByAdmin = verifiedByAdmin;
    }
    const records = await this.prisma.pTPlan.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
    return records.map(this.toDomain);
  }

  async countByAdminVerification(verifiedByAdmin?: boolean): Promise<number> {
    const where: any = {};
    if (verifiedByAdmin !== undefined) {
      where.verifiedByAdmin = verifiedByAdmin;
    }
    return this.prisma.pTPlan.count({ where });
  }



  async adminVerifyPTPlan(id: string, verifiedByAdmin: boolean): Promise<PTPlan> {
  const record = await this.prisma.pTPlan.update({
    where: { id },
    data: {
      verifiedByAdmin,
      updatedAt: new Date(),
    },
  });
  if (!record) {
    throw new Error(ERRORMESSAGES.PTPLAN_NOT_FOUND.message);
  }
  return this.toDomain(record);
}

async updateAdminPrice(id: string, adminPrice: number, totalPrice: number): Promise<PTPlan> {
  const record = await this.prisma.pTPlan.update({
    where: { id },
    data: {
      adminPrice,
      totalPrice,
      updatedAt: new Date(),
    },
  });
  if (!record) {
    throw new Error(ERRORMESSAGES.PTPLAN_NOT_FOUND.message);
  }
  return this.toDomain(record);
}

}