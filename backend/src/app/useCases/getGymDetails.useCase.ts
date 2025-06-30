import { IGetGymDetailsResponseDTO, GymDetailsDTO } from '@/domain/dtos/getGymDetailsResponse.dto';
import { GetGymDetailsRequestDTO } from '@/domain/dtos/getGymDetailsRequest.dto';
import { Gym } from '@/domain/entities/Gym.entity';
import { IGymsRepository } from '@/app/repositories/gym.repository.';
import { GymErrorType } from '@/domain/enums/gymErrorType.enums';

export class GetGymDetailsUseCase {
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
      facilities: gym.facilities
        ? {
            hasPool: gym.facilities.hasPool || null,
            hasSauna: gym.facilities.hasSauna || null,
            hasParking: gym.facilities.hasParking || null,
            hasLockerRooms: gym.facilities.hasLockerRooms || null,
            hasWifi: gym.facilities.hasWifi || null,
            hasShowers: gym.facilities.hasShowers || null,
          }
        : undefined,
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
    if (!gymId) {
      throw new Error(GymErrorType.MissingRequiredFields);
    }

    const gym = await this.gymsRepository.findById(gymId);
    if (!gym) {
      return { success: false, data: null };
    }

    const gymDetailsDTO = this.toGymDetailsDTO(gym);
    return { success: true, data: gymDetailsDTO };
  }
}