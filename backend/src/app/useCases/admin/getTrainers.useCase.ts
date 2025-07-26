import { ITrainersRepository } from '../../repositories/trainers.repository';
import { IGetTrainersResponseDTO } from '../../../domain/dtos/getTrainersResponse.dto';
import { HttpStatus } from '../../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../../domain/constants/errorMessages.constant';
import { S3Service } from '@/infra/providers/s3.service';
import { IGetTrainersUseCase } from './interfeces/IGetTrainersUseCase';
import { IAdminTrainersRequestDTO } from '@/domain/dtos/admin/adminTrainersRequestDTO';

export class GetTrainersUseCase implements IGetTrainersUseCase {
  constructor(
    private readonly trainersRepository: ITrainersRepository,
    private readonly s3Service: S3Service
  ) {}

  async execute(data: IAdminTrainersRequestDTO): Promise<IGetTrainersResponseDTO> {
    try {
      const { page, limit, search, status, specialization } = data;
      const skip = (page - 1) * limit;

      const [trainers, totalTrainers, pendingApproval, activeTrainers, suspended] = await Promise.all([
        this.trainersRepository.findAll(skip, limit, search, status, specialization),
        this.trainersRepository.count(search, status, specialization),
        this.trainersRepository.countPending(),
        this.trainersRepository.countApproved(),
        this.trainersRepository.countSuspended(),
      ]);

    const trainersWithUrls = await Promise.all(
        trainers.map(async (trainer) => {
          let profilePicUrl = trainer.profilePic;
          if (profilePicUrl && profilePicUrl.startsWith('trainer-profiles/')) {
            profilePicUrl = await this.s3Service.getPresignedUrl(profilePicUrl) || trainer.profilePic;
          }
          const trainerJson = trainer.toJSON();
          return { ...trainerJson, profilePic: profilePicUrl };
        })
      );

      return {
        success: true,
        status: HttpStatus.OK,
        data: {
          trainers: trainersWithUrls,
          stats: {
            totalTrainers,
            pendingApproval,
            activeTrainers,
            suspended,
          },
          totalPages: Math.ceil(totalTrainers / limit),
        },
        message: trainers.length > 0 ? MESSAGES.TRAINERS_FETCHED : MESSAGES.TRAINERS_NO_TRAINERS_FOUND,
      };
    } catch (error) {
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: ERRORMESSAGES.TRAINER_FAILED_TO_FETCH_TRAINERS.code,
          message: ERRORMESSAGES.TRAINER_FAILED_TO_FETCH_TRAINERS.message,
        },
      };
    }
  }
}