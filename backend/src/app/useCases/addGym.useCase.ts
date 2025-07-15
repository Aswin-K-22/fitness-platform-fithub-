import { ITrainersRepository } from '@/app/repositories/trainers.repository';
import { AddGymRequestDTO } from '@/domain/dtos/addGymRequest.dto';
import { Gym } from '@/domain/entities/Gym.entity';
import { Prisma } from '@prisma/client';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import { AddGymResponseDTO } from '@/domain/dtos/addGymResponse.dto';
import { IGymsRepository } from '../repositories/gym.repository.';
import { IAddGymUseCase } from './interfaces/IAddGymUseCase';



export class AddGymUseCase implements IAddGymUseCase {
  constructor(
    private gymsRepository: IGymsRepository,
    private trainersRepository: ITrainersRepository
  ) {}

  private getMembershipCompatibility(type: string): string[] {
    switch (type) {
      case 'Basic':
        return ['Basic'];
      case 'Premium':
        return ['Basic', 'Premium'];
      case 'Diamond':
        return ['Basic', 'Premium', 'Diamond'];
      default:
        return [];
    }
  }

  async execute(
    gymData: AddGymRequestDTO,
    imageUrls: string[]
  ): Promise<AddGymResponseDTO> {
    try {
      // Validate required fields
      const requiredFields: (keyof AddGymRequestDTO)[] = [
        'name',
        'type',
        'address',
        'contact',
        'schedule',
        'maxCapacity',
      ];
      const missingFields = requiredFields.filter((field) => !gymData[field]);
      if (missingFields.length > 0) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.GYM_MISSING_REQUIRED_FIELDS.code,
            message: `${ERRORMESSAGES.GYM_MISSING_REQUIRED_FIELDS.message}: ${missingFields.join(', ')}`,
          },
        };
      }

      if (
        !gymData.address?.street ||
        !gymData.address?.city ||
        !gymData.address?.state ||
        !gymData.address?.postalCode ||
        !gymData.address?.lat ||
        !gymData.address?.lng
      ) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.GYM_MISSING_REQUIRED_FIELDS.code,
            message: ERRORMESSAGES.GYM_MISSING_REQUIRED_FIELDS.message,
          },
        };
      }

      if (!gymData.contact?.phone || !gymData.contact?.email) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.GYM_MISSING_REQUIRED_FIELDS.code,
            message: ERRORMESSAGES.GYM_MISSING_REQUIRED_FIELDS.message,
          },
        };
      }

      if (!gymData.schedule?.length) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.GYM_MISSING_REQUIRED_FIELDS.code,
            message: ERRORMESSAGES.GYM_MISSING_REQUIRED_FIELDS.message,
          },
        };
      }

      if (imageUrls.length === 0) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.GYM_MISSING_IMAGES.code,
            message: ERRORMESSAGES.GYM_MISSING_IMAGES.message,
          },
        };
      }

      // Check for duplicate gym name
      const existingGym = await this.gymsRepository.findByName(gymData.name);
      if (existingGym) {
        return {
          success: false,
          status: HttpStatus.CONFLICT,
          error: {
            code: ERRORMESSAGES.GYM_DUPLICATE_GYM_NAME.code,
            message: ERRORMESSAGES.GYM_DUPLICATE_GYM_NAME.message,
          },
        };
      }

      // Validate trainer availability
      if (gymData.trainers && gymData.trainers.length > 0) {
        const trainerIds = gymData.trainers.map((t) => t.trainerId);
        const availabilityCheck = await this.trainersRepository.checkTrainerAvailability(trainerIds);
        if (!availabilityCheck.isValid) {
          return {
            success: false,
            status: HttpStatus.BAD_REQUEST,
            error: {
              code: ERRORMESSAGES.GYM_INVALID_TRAINER_IDS.code,
              message: ERRORMESSAGES.GYM_INVALID_TRAINER_IDS.message,
            },
          };
        }
      }

      // Prepare gym data for creation
      const gymToCreate: Gym =  new Gym({
        name: gymData.name,
        type: gymData.type,
        description: gymData.description,
        address: {
          street: gymData.address.street,
          city: gymData.address.city,
          state: gymData.address.state,
          postalCode: gymData.address.postalCode,
          lat: parseFloat(gymData.address.lat),
          lng: parseFloat(gymData.address.lng),
        },
        location: {
          type: 'Point',
          coordinates: [parseFloat(gymData.address.lng), parseFloat(gymData.address.lat)],
        },
        contact: gymData.contact,
        equipment: gymData.equipment || [],
        schedule: gymData.schedule.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          isClosed: s.isClosed,
          slotDuration: s.slotDuration,
          slotCapacity: s.slotCapacity,
        })),
        maxCapacity: gymData.maxCapacity,
        trainers: gymData.trainers || [],
        facilities: gymData.facilities,
        images: imageUrls.map((url) => ({ url, uploadedAt: new Date() })),
        membershipCompatibility: this.getMembershipCompatibility(gymData.type),
      });

      // Create gym
      const createdGym = await this.gymsRepository.create(gymToCreate);

      // Assign trainers to gym
      if (gymData.trainers && gymData.trainers.length > 0) {
        const trainerIds = gymData.trainers.map((t) => t.trainerId);
        await this.trainersRepository.assignTrainersToGym(trainerIds, createdGym.id!);
      }

      return {
        success: true,
        status: HttpStatus.CREATED,
        message: MESSAGES.GYM_ADDED,
        data: { gym: createdGym.toJSON() },
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