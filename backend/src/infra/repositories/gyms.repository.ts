// backend/src/infra/repositories/gyms.repository.ts

import { PrismaClient, Prisma } from '@prisma/client';
import { Gym } from '@/domain/entities/Gym.entity';
import { IGymsRepository } from '@/app/repositories/gym.repository.';

export class GymsRepository implements IGymsRepository {
  constructor(private prisma: PrismaClient) {}

  async findAllForUsers(
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
  ): Promise<Gym[]> {
    const { search, lat, lng, radius, gymType, rating } = filters;

    if (lat !== undefined && lng !== undefined && radius !== undefined) {
      const maxDistance = radius * 1000; // km to meters
      const aggregationResult = await this.prisma.$runCommandRaw({
        aggregate: 'Gym',
        pipeline: [
          {
            $geoNear: {
              near: { type: 'Point', coordinates: [lng, lat] },
              distanceField: 'distance',
              maxDistance,
              key: 'location',
              spherical: true,
            },
          },
          ...(gymType && gymType !== 'All Types' ? [{ $match: { type: gymType } }] : []),
          ...(rating && rating !== 'Any Rating'
            ? [{ $match: { 'ratings.average': { $gte: parseFloat(rating) } } }]
            : []),
          ...(search
            ? [
                {
                  $match: {
                    $or: [
                      { name: { $regex: `^${search}`, $options: 'i' } },
                      { name: { $regex: search, $options: 'i' } },
                    ],
                  },
                },
              ]
            : []),
          { $skip: skip },
          { $limit: take },
          {
            $project: {
              id: { $toString: '$_id' },
              name: 1,
              address: 1,
              type: 1,
              images: 1,
              ratings: 1,
              location: 1,
              description: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
        cursor: {},
      });

      const result = aggregationResult as { cursor?: { firstBatch?: any[] } };
      const gyms = result.cursor?.firstBatch || [];

      return gyms.map(
        (gym: any) =>
          new Gym({
            id: gym.id,
            name: gym.name,
            address: gym.address || null,
            type: gym.type || null,
            images: gym.images || null,
            ratings: gym.ratings || null,
            location: gym.location || null,
            description: gym.description || null,
            createdAt: gym.createdAt,
            updatedAt: gym.updatedAt,
          })
      );
    }

    const whereBase: Prisma.GymWhereInput = {};
    if (gymType && gymType !== 'All Types') whereBase.type = gymType;
    if (rating && rating !== 'Any Rating') {
      const minRating = parseFloat(rating);
      whereBase.ratings = { is: { average: { gte: minRating } } };
    }

    let gyms: any[] = [];
    if (search) {
      const startsWithGyms = await this.prisma.gym.findMany({
        where: { ...whereBase, name: { startsWith: search, mode: 'insensitive' } },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          address: true,
          type: true,
          images: true,
          ratings: true,
          location: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      const containsGyms = await this.prisma.gym.findMany({
        where: {
          ...whereBase,
          name: { contains: search, mode: 'insensitive' },
          NOT: startsWithGyms.map((gym) => ({ id: gym.id })),
        },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          address: true,
          type: true,
          images: true,
          ratings: true,
          location: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      gyms = [...startsWithGyms, ...containsGyms];
    } else {
      gyms = await this.prisma.gym.findMany({
        where: whereBase,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          address: true,
          type: true,
          images: true,
          ratings: true,
          location: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    const paginatedGyms = gyms.slice(skip, skip + take);
    return paginatedGyms.map(
      (gym) =>
        new Gym({
          id: gym.id,
          name: gym.name,
          address: gym.address || null,
          type: gym.type || null,
          images: gym.images || null,
          ratings: gym.ratings || null,
          location: gym.location || null,
          description: gym.description || null,
          createdAt: gym.createdAt,
          updatedAt: gym.updatedAt,
        })
    );
  }

  async countWithFilters(filters: {
    search?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    gymType?: string;
    rating?: string;
  }): Promise<number> {
    const { search, lat, lng, radius, gymType, rating } = filters;

    if (lat !== undefined && lng !== undefined && radius !== undefined) {
      const maxDistance = radius * 1000;
      const aggregationResult = await this.prisma.$runCommandRaw({
        aggregate: 'Gym',
        pipeline: [
          {
            $geoNear: {
              near: { type: 'Point', coordinates: [lng, lat] },
              distanceField: 'distance',
              maxDistance,
              spherical: true,
            },
          },
          ...(gymType && gymType !== 'All Types' ? [{ $match: { type: gymType } }] : []),
          ...(rating && rating !== 'Any Rating'
            ? [{ $match: { 'ratings.average': { $gte: parseFloat(rating) } } }]
            : []),
          ...(search
            ? [
                {
                  $match: {
                    $or: [
                      { name: { $regex: `^${search}`, $options: 'i' } },
                      { name: { $regex: search, $options: 'i' } },
                    ],
                  },
                },
              ]
            : []),
          { $count: 'total' },
        ],
        cursor: {},
      });

      const result = aggregationResult as { cursor?: { firstBatch?: [{ total: number }] } };
      return result.cursor?.firstBatch?.[0]?.total || 0;
    }

    const where: Prisma.GymWhereInput = {};
    if (search) {
      where.OR = [
        { name: { startsWith: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (gymType && gymType !== 'All Types') where.type = gymType;
    if (rating && rating !== 'Any Rating') {
      const minRating = parseFloat(rating);
      where.ratings = { is: { average: { gte: minRating } } };
    }

    return this.prisma.gym.count({ where });
  }
}