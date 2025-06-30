// backend/src/app/repositories/gyms.repository.ts

import { Gym } from '@/domain/entities/Gym.entity';

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
}