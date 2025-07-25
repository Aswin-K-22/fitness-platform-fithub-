import { ITrainersRepository } from '../repositories/trainers.repository';
import { IGetTrainerResponseDTO, TrainerAuth } from '../../domain/dtos/getTrainerResponse.dto';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import { IGetTrainerUseCase } from './interfaces/IGetTrainerUseCase';
import { S3Service } from '@/infra/providers/s3.service';

export class GetTrainerUseCase implements IGetTrainerUseCase {
  constructor(
    private trainersRepository: ITrainersRepository,
    private readonly s3Service: S3Service
  ) {}

  async execute(email: string): Promise<IGetTrainerResponseDTO> {
    try {
      const trainer = await this.trainersRepository.findByEmail(email);
      if (!trainer) {
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          error: {
            code: ERRORMESSAGES.TRAINER_NOT_FOUND.code,
            message: ERRORMESSAGES.TRAINER_NOT_FOUND.message,
          },
        };
      }

      let profilePicUrl = trainer.profilePic;
      if (profilePicUrl) {
        if (profilePicUrl && profilePicUrl.startsWith('trainer-profiles/')) {
           profilePicUrl = await this.s3Service.getPresignedUrl(profilePicUrl) || trainer.profilePic;
        }
      }

      const trainerResponse: TrainerAuth = {
        id: trainer.id!,
        email: email,
        name: trainer.name,
        role: trainer.role,
        profilePic: profilePicUrl || null,
        isVerified: trainer.isVerified,
        verifiedByAdmin: trainer.verifiedByAdmin,
      };

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.SUCCESS,
        data: { trainer: trainerResponse },
      };
    } catch (error) {
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: ERRORMESSAGES.TRAINER_FIND_BY_EMAIL_FAILED.code,
          message: ERRORMESSAGES.TRAINER_FIND_BY_EMAIL_FAILED.message,
        },
      };
    }
  }
}