import { GetAdminGymsRequestDTO } from '@/domain/dtos/getAdminGymsRequest.dto';
import { GetAdminGymsResponseDTO } from '@/domain/dtos/getAdminGymsResponse.dto';
import { GymErrorType } from '@/domain/enums/gymErrorType.enums';
import { IGymsRepository } from '../repositories/gym.repository.';

export class GetAdminGymsUseCase {
  constructor(private gymsRepository: IGymsRepository) {}

  async execute({
    page,
    limit,
    search,
  }: GetAdminGymsRequestDTO): Promise<GetAdminGymsResponseDTO> {
    const skip = (page - 1) * limit;

    try {
      const [gyms, total] = await Promise.all([
        this.gymsRepository.findAllForAdmin(skip, limit, search),
        this.gymsRepository.countForAdmin(search),
      ]);

      return {
        gyms,
        total,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new Error(GymErrorType.FailedToFetchGyms);
    }
  }
}