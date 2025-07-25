// backend/src/infra/repositories/gyms.repository.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { Gym } from '@/domain/entities/Gym.entity';
import { IGymsRepository } from '@/app/repositories/gym.repository.';
import { BaseRepository } from './base.repository';
import { isValidLocation } from '@/domain/valueObjects/location.valueObject';

export class GymsRepository extends BaseRepository<Gym> implements IGymsRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, 'gym');
  }

  protected toDomain(record: any): Gym {
    return new Gym({
      id: record.id,
      name: record.name,
      type: record.type || null,
      description: record.description || null,
      maxCapacity: record.maxCapacity,
      membershipCompatibility: record.membershipCompatibility || [],
      address: record.address || null,
      contact: record.contact || null,
      equipment: record.equipment || [],
      schedule: record.schedule || [],
      trainers: record.trainers || [],
      facilities: record.facilities || null,
      location: record.location && isValidLocation(record.location)
        ? { type: record.location.type, coordinates: record.location.coordinates }
        : null,
      images: (record.images || []).map((img: any) => ({
        url: img.url,
        description: img.description || null,
        uploadedAt: img.uploadedAt instanceof Date ? img.uploadedAt : new Date(img.uploadedAt),
      })),
      ratings: record.ratings || null,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

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
  try {
    const { search, lat, lng, radius, gymType, rating } = filters;
    console.log('findAllForUsers - Input parameters:', { skip, take, filters });

    if (skip < 0 || take <= 0) {
      console.error('Invalid pagination parameters:', { skip, take });
      throw new Error('Invalid skip or take values');
    }

    if (lat !== undefined && lng !== undefined && radius !== undefined) {
      const maxDistance = radius * 1000;
      console.log('Performing geoNear query with:', { lat, lng, radius, maxDistance });

      const aggregationPipeline = [
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
            facilities: 1,
          },
        },
      ];
      console.log('Aggregation pipeline:', JSON.stringify(aggregationPipeline, null, 2));

      const aggregationResult: any = await this.prisma.$runCommandRaw({
        aggregate: 'Gym',
        pipeline: aggregationPipeline,
        cursor: {},
      }).catch((error  :any) => {
        console.error('Error executing geoNear aggregation:', error);
        throw new Error(`GeoNear query failed: ${error.message}`);
      });

      console.log('Raw aggregation result:', aggregationResult);

      const gyms = (aggregationResult.cursor?.firstBatch || []).map((g: any) => {
        try {
          const gym = this.toDomain(g);
          console.log('Transformed gym:', gym.toJSON());
          return gym;
        } catch (transformError) {
          console.error('Error transforming gym record:', g, transformError);
          throw transformError;
        }
      });

      console.log('GeoNear query returned:', gyms.length, 'gyms');
      return gyms;
    }

    // Non-geo query with prioritized search
    console.log('Performing non-geo query with filters:', filters);
    const whereBase: Prisma.GymWhereInput = {};
    if (gymType && gymType !== 'All Types') whereBase.type = gymType;
    if (rating && rating !== 'Any Rating') {
      const minRating = parseFloat(rating);
      if (isNaN(minRating)) {
        console.error('Invalid rating filter:', rating);
        throw new Error('Invalid rating value');
      }
      whereBase.ratings = { is: { average: { gte: minRating } } };
    }

    let gyms: any[] = [];
    if (search) {
      // Fetch gyms starting with the search term
      const startsWithGyms = await this.prisma.gym.findMany({
        where: { ...whereBase, name: { startsWith: search, mode: 'insensitive' } },
        orderBy: { name: 'asc' },
      }).catch((error: { message: any; }) => {
        console.error('Error fetching startsWith gyms:', error);
        throw new Error(`StartsWith query failed: ${error.message}`);
      });
      console.log('StartsWith gyms:', startsWithGyms.length);

      // Fetch gyms containing the search term, excluding those already in startsWith
      const containsGyms = await this.prisma.gym.findMany({
        where: {
          ...whereBase,
          name: { contains: search, mode: 'insensitive' },
          NOT: startsWithGyms.map((gym: { id: any; }) => ({ id: gym.id })),
        },
        orderBy: { name: 'asc' },
      }).catch((error: { message: any; }) => {
        console.error('Error fetching contains gyms:', error);
        throw new Error(`Contains query failed: ${error.message}`);
      });
      console.log('Contains gyms:', containsGyms.length);

      gyms = [...startsWithGyms, ...containsGyms];
    } else {
      gyms = await this.prisma.gym.findMany({
        where: whereBase,
        orderBy: { name: 'asc' },
      }).catch((error: { message: any; }) => {
        console.error('Error fetching all gyms:', error);
        throw new Error(`Prisma query failed: ${error.message}`);
      });
      console.log('All gyms (no search):', gyms.length);
    }

    // Apply pagination
    const paginatedGyms = gyms.slice(skip, skip + take);
    console.log('Paginated gyms:', paginatedGyms.length);

    const transformedGyms = paginatedGyms.map((gym) => {
      try {
        const transformed = this.toDomain(gym);
        console.log('Transformed gym (non-geo):', transformed.toJSON());
        return transformed;
      } catch (transformError) {
        console.error('Error transforming gym record (non-geo):', gym, transformError);
        throw transformError;
      }
    });

    console.log('Final gyms returned:', transformedGyms.length);
    return transformedGyms;
  } catch (error) {
    console.error('findAllForUsers failed:', error);
    throw new Error(`Failed to fetch gyms: ${error}`);
  }
}

  async countWithFilters(filters: {
    search?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    gymType?: string;
    rating?: string;
  }): Promise<number> {
    const { lat, lng, radius, gymType, rating, search } = filters;

    if (lat !== undefined && lng !== undefined && radius !== undefined) {
      const maxDistance = radius * 1000;
      const aggregationResult: any = await this.prisma.$runCommandRaw({
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
            ? [{ $match: { name: { $regex: search, $options: 'i' } } }]
            : []),
          { $count: 'total' },
        ],
        cursor: {},
      });
      return aggregationResult.cursor?.firstBatch?.[0]?.total || 0;
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

  async findByName(name: string): Promise<Gym | null> {
    const gym = await this.prisma.gym.findUnique({ where: { name } });
    return gym ? this.toDomain(gym) : null;
  }

  async findAllForAdmin(skip: number, take: number, search?: string): Promise<Gym[]> {
    const where: Prisma.GymWhereInput = search
      ? { name: { startsWith: search.trim(), mode: 'insensitive' } }
      : {};
    const gyms = await this.prisma.gym.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
    return gyms.map(this.toDomain);
  }

  async countForAdmin(search?: string): Promise<number> {
    const where: Prisma.GymWhereInput = search
      ? {
          OR: [
            { name: { startsWith: search.trim(), mode: 'insensitive' } },
            { name: { contains: search.trim(), mode: 'insensitive' } },
          ],
        }
      : {};
    return this.prisma.gym.count({ where });
  }
}