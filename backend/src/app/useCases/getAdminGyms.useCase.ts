import { GetAdminGymsRequestDTO } from '@/domain/dtos/getAdminGymsRequest.dto';
import { IGetAdminGymsResponseDTO } from '@/domain/dtos/getAdminGymsResponse.dto';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import { IGymsRepository } from '../repositories/gym.repository.';

export class GetAdminGymsUseCase {
  constructor(private gymsRepository: IGymsRepository) {}

  async execute({
    page,
    limit,
    search,
  }: GetAdminGymsRequestDTO): Promise<IGetAdminGymsResponseDTO> {
    try {
      const skip = (page - 1) * limit;

      const [gyms, total] = await Promise.all([
        this.gymsRepository.findAllForAdmin(skip, limit, search),
        this.gymsRepository.countForAdmin(search),
      ]);

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.SUCCESS,
        data: {
          gyms,
          total,
          totalPages: Math.ceil(total / limit),
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