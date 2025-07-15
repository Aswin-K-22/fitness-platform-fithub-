import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { MESSAGES } from '@/domain/constants/messages.constant';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { GetGymDetailsRequestDTO } from '@/domain/dtos/getGymDetailsRequest.dto';
import { IGetGymDetailsResponseDTO, GymDetailsDTO } from '@/domain/dtos/getGymDetailsResponse.dto';
import { Gym } from '@/domain/entities/Gym.entity';
import { IGymsRepository } from '../repositories/gym.repository.';
import { IGetGymDetailsUseCase } from './interfaces/IGetGymDetailsUseCase';

export class GetGymDetailsUseCase implements IGetGymDetailsUseCase {
  constructor(private gymsRepository: IGymsRepository) {}

  private toGymDetailsDTO(gym: Gym): GymDetailsDTO {
    return {
      id: gym.id || '',
      name: gym.name,
      type: gym.type || undefined,
      description: gym.description || null,
      maxCapacity: gym.maxCapacity,
      membershipCompatibility: gym.membershipCompatibility || [],
      address: gym.address
        ? {
            street: gym.address.street || null,
            city: gym.address.city || null,
            state: gym.address.state || null,
            postalCode: gym.address.postalCode || null,
            lat: gym.address.lat || null,
            lng: gym.address.lng || null,
          }
        : undefined,
      contact: gym.contact
        ? {
            phone: gym.contact.phone || null,
            email: gym.contact.email || null,
            website: gym.contact.website || null,
          }
        : undefined,
      equipment: gym.equipment || [],
      schedule: gym.schedule || [],
      trainers: gym.trainers || [],
      facilities: gym.facilities || [],
      images: (gym.images || []).map((img) => ({
        url: img.url,
        uploadedAt: img.uploadedAt instanceof Date ? img.uploadedAt.toISOString() : img.uploadedAt,
      })),
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

  async execute({ gymId }: GetGymDetailsRequestDTO): Promise<IGetGymDetailsResponseDTO> {
    try {
      if (!gymId) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.GYM_MISSING_REQUIRED_FIELDS.code,
            message: ERRORMESSAGES.GYM_MISSING_REQUIRED_FIELDS.message,
          },
        };
      }

      const gym = await this.gymsRepository.findById(gymId);
      if (!gym) {
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          error: {
            code: ERRORMESSAGES.GYM_NOT_FOUND.code,
            message: ERRORMESSAGES.GYM_NOT_FOUND.message,
          },
        };
      }

      const gymDetailsDTO = this.toGymDetailsDTO(gym);
      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.SUCCESS,
        data: { gym: gymDetailsDTO },
      };
    } catch (error) {
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: ERRORMESSAGES.GENERIC_ERROR.code,
          message: ERRORMESSAGES.GENERIC_ERROR.message,
        },
      };
    }
  }
}