import { ITrainersRepository } from '@/app/repositories/trainers.repository';
import { AddGymRequestDTO } from '@/domain/dtos/addGymRequest.dto';
import { AddGymResponseDTO } from '@/domain/dtos/addGymResponse.dto';
import { Gym } from '@/domain/entities/Gym.entity';
import { Prisma } from '@prisma/client';
import { IGymsRepository } from '../repositories/gym.repository.';
import { GymErrorType } from '@/domain/enums/gymErrorType.enums';

export class AddGymUseCase {
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
      throw new Error(`${GymErrorType.MissingRequiredFields}: ${missingFields.join(', ')}`);
    }

    if (!gymData.address?.street || !gymData.address?.city || !gymData.address?.state || !gymData.address?.postalCode || !gymData.address?.lat || !gymData.address?.lng) {
      throw new Error(GymErrorType.MissingRequiredFields);
    }

    if (!gymData.contact?.phone || !gymData.contact?.email) {
      throw new Error(GymErrorType.MissingRequiredFields);
    }

    if (!gymData.schedule?.length) {
      throw new Error(GymErrorType.MissingRequiredFields);
    }

    if (imageUrls.length === 0) {
      throw new Error(GymErrorType.MissingImages);
    }

    // Check for duplicate gym name
    const existingGym = await this.gymsRepository.findByName(gymData.name);
    if (existingGym) {
      throw new Error(GymErrorType.DuplicateGymName);
    }

    // Validate trainer availability
    if (gymData.trainers && gymData.trainers.length > 0) {
      const trainerIds = gymData.trainers.map((t) => t.trainerId);
      const availabilityCheck = await this.trainersRepository.checkTrainerAvailability(trainerIds);
      if (!availabilityCheck.isValid) {
        throw new Error(GymErrorType.InvalidTrainerIds);
      }
    }

    // Prepare gym data for creation
    const gymToCreate: Prisma.GymCreateInput = {
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
      facilities: gymData.facilities
        ? {
            hasPool: gymData.facilities.includes('Pool'),
            hasSauna: gymData.facilities.includes('Sauna'),
            hasParking: gymData.facilities.includes('Parking'),
            hasLockerRooms: gymData.facilities.includes('Lockers'),
            hasWifi: gymData.facilities.includes('Wifi'),
            hasShowers: gymData.facilities.includes('Showers'),
          }
        : undefined,
      images: imageUrls.map((url) => ({ url, uploadedAt: new Date() })),
      membershipCompatibility: this.getMembershipCompatibility(gymData.type),
    };

    // Create gym
    const createdGym = await this.gymsRepository.create(gymToCreate);

    // Assign trainers to gym
    if (gymData.trainers && gymData.trainers.length > 0) {
      const trainerIds = gymData.trainers.map((t) => t.trainerId);
      await this.trainersRepository.assignTrainersToGym(trainerIds, createdGym.id!);
    }

    return {
      success: true,
      gym: createdGym.toJSON(),
      message: 'Gym created successfully',
    };
  }
}