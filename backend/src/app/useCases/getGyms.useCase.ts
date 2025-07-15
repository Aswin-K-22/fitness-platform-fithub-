import { GetGymsRequestDTO } from '@/domain/dtos/getGymsRequest.dto';
import { IGetGymsResponseDTO, GymDTO } from '@/domain/dtos/getGymsResponse.dto';
import { Gym } from '@/domain/entities/Gym.entity';
import { IGymsRepository } from '../repositories/gym.repository.';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { MESSAGES } from '@/domain/constants/messages.constant';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { IGetGymsUseCase } from './interfaces/IGetGymsUseCase';


export class GetGymsUseCase implements IGetGymsUseCase {
  constructor(private gymsRepository: IGymsRepository) {}

  private toGymDTO(gym: Gym): GymDTO {
    return {
      id: gym.id || '', 
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
    try {
      // Validate filters
      if ((lat !== undefined && lng === undefined) || (lat === undefined && lng !== undefined)) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.GYM_INVALID_FILTERS.code,
            message: ERRORMESSAGES.GYM_INVALID_FILTERS.message,
          },
        };
      }

      if (radius !== undefined && (lat === undefined || lng === undefined)) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.GYM_INVALID_FILTERS.code,
            message: ERRORMESSAGES.GYM_INVALID_FILTERS.message,
          },
        };
      }

      const skip = (page - 1) * limit;
      const filters = { search, lat, lng, radius, gymType, rating };

      const gyms: Gym[] = await this.gymsRepository.findAllForUsers(skip, limit, filters);
      console.log('getGymusecase',skip,limit,filters)

      const totalGyms = await this.gymsRepository.countWithFilters(filters);
      console.log('getGymusecase-2')

      const totalPages = Math.ceil(totalGyms / limit);

      const gymDTOs: GymDTO[] = gyms.map((gym) => this.toGymDTO(gym));

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.SUCCESS,
        data: {
          gyms: gymDTOs,
          page,
          totalPages,
          totalGyms,
        },
      };
    } catch (error) {
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: ERRORMESSAGES.GYM_FAILED_TO_FETCH_GYMS.code,
          message: ERRORMESSAGES.GYM_FAILED_TO_FETCH_GYMS.message,
        },
      };
    }
  }
}