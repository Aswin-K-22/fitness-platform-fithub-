// backend/src/app/useCases/getGyms.useCase.ts

import { GymDTO, IGetGymsResponseDTO } from '@/domain/dtos/getGymsResponse.dto';
import { Gym } from '@/domain/entities/Gym.entity';
import { IGymsRepository } from '../repositories/gym.repository.';
import { GetGymsRequestDTO } from '@/domain/dtos/getGymsRequest.dto';
import { GymErrorType } from '@/domain/enums/gymErrorType.enums';

export class GetGymsUseCase {
  constructor(private gymsRepository: IGymsRepository) {}
  private toGymDTO(gym: Gym): GymDTO {
    return {
      id: gym.id || '', // Ensure id is always a string
      name: gym.name,
      type: gym.type || undefined,
      description: gym.description || undefined,
      address: gym.address
        ? {
            city: gym.address.city || undefined,
            state: gym.address.state || undefined,
            country: gym.address.country || undefined,
            postalCode: gym.address.postalCode || undefined,
            lat: gym.address.lat || undefined,
            lng: gym.address.lng || undefined,
            street: gym.address.street || undefined,
          }
        : undefined,
      image: gym.images && gym.images.length > 0 ? gym.images[0].url : undefined, 
      ratings: gym.ratings
        ? {
            average: gym.ratings.average || undefined,
            count: gym.ratings.count || undefined,
          }
        : undefined,
      createdAt: gym.createdAt instanceof Date ? gym.createdAt.toISOString() : gym.createdAt || undefined,
      updatedAt: gym.updatedAt instanceof Date ? gym.updatedAt.toISOString() : gym.updatedAt || undefined,
    };
  }

  async execute({
    page = 1,
    limit = 3,
    search,
    lat,
    lng,
    radius,
    gymType,
    rating,
  }: GetGymsRequestDTO): Promise<IGetGymsResponseDTO> {
    const skip = (page - 1) * limit;

    // Validate filters
    if (lat !== undefined && lng === undefined || lat === undefined && lng !== undefined) {
      throw new Error(GymErrorType.InvalidFilters);
    }
    if (radius !== undefined && (lat === undefined || lng === undefined)) {
      throw new Error(GymErrorType.InvalidFilters);
    }

    const filters = { search, lat, lng, radius, gymType, rating };
    const gyms: Gym[] = await this.gymsRepository.findAllForUsers(skip, limit, filters);
    const totalGyms = await this.gymsRepository.countWithFilters(filters);
    const totalPages = Math.ceil(totalGyms / limit);

   const gymDTOs: GymDTO[] = gyms.map((gym) => this.toGymDTO(gym));

    return {
      success: true,
      gyms: gymDTOs,
      page,
      totalPages,
      totalGyms,
    };
  }
}