// backend/src/app/repositories/gyms.repository.ts

import { Gym } from '@/domain/entities/Gym.entity';
import { Prisma } from '@prisma/client';

export interface IGymsRepository {
  findAllForUsers(
    skip: number,
    take: number,
    filters: {
      search?: string;
      lat?: number;
      lng?: number;
      radius?: number;
      gymType?: string;
      rating?: string;
    }
  ): Promise<Gym[]>;
  countWithFilters(filters: {
    search?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    gymType?: string;
    rating?: string;
  }): Promise<number>;
  findById(id: string): Promise<Gym | null>;
  findAllForAdmin(
    skip: number,
    take: number,
    search?: string
  ): Promise<Gym[]>;
  countForAdmin(search?: string): Promise<number>;
   findByName(name: string): Promise<Gym | null>;
  create(data: Prisma.GymCreateInput): Promise<Gym>;
}