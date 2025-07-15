// backend/src/infra/repositories/base.repository.ts
import { PrismaClient } from '@prisma/client';
import { IBaseRepository } from '@/app/repositories/base.repository';

export abstract class BaseRepository<T, ID = string> implements IBaseRepository<T, ID> {
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly model: keyof PrismaClient
  ) {}

  async create(data: T): Promise<T> {
    const record = await (this.prisma[this.model] as any).create({ data });
    return this.toDomain(record);
  }

  async findById(id: ID): Promise<T | null> {
    const record = await (this.prisma[this.model] as any).findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findAll(skip: number, take: number): Promise<T[]> {
    const records = await (this.prisma[this.model] as any).findMany({ skip, take });
    return records.map(this.toDomain);
  }

  async update(id: ID, data: Partial<T>): Promise<T | null> {
    const record = await (this.prisma[this.model] as any).update({
      where: { id },
      data,
    });
    return record ? this.toDomain(record) : null;
  }

  async delete(id: ID): Promise<void> {
    await (this.prisma[this.model] as any).delete({ where: { id } });
  }

  async count(): Promise<number> {
    return (this.prisma[this.model] as any).count();
  }

  protected abstract toDomain(record: any): T;
}