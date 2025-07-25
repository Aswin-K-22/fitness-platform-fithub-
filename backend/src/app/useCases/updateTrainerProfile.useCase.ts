import { ITrainersRepository } from '../repositories/trainers.repository';
import { IUpdateTrainerProfileUseCaseDTO, TrainerProfile } from '@/domain/dtos/updateTrainerProfileResponse.dto';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import { IUpdateTrainerProfileUseCase } from './interfaces/IUpdateTrainerProfileUseCase';
import { S3Service } from '@/infra/providers/s3.service';
import { IResponseDTO } from '@/domain/dtos/response.dto';
import { TrainerResponseDTO } from '@/domain/dtos/getTrainersResponse.dto';

export class UpdateTrainerProfileUseCase implements IUpdateTrainerProfileUseCase {
  constructor(
    private readonly trainerRepository: ITrainersRepository,
    private readonly s3Service: S3Service
  ) {}
async execute(data: IUpdateTrainerProfileUseCaseDTO, trainerId: string): Promise<IResponseDTO<TrainerResponseDTO>> {
    try {
      const trainer = await this.trainerRepository.findById(trainerId);
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

      // Handle image upload if provided
      let profilePicUrl = trainer.profilePic;
      if (data.profilePic) {
        if (profilePicUrl && profilePicUrl.startsWith('trainer-profiles/')) {
          await this.s3Service.deleteFile(profilePicUrl);
        }
        profilePicUrl = data.profilePic;
      }

      // Prepare update data with defaults from existing trainer
    const updateData: IUpdateTrainerProfileUseCaseDTO = {
        name: data.name ?? trainer.name,
        bio: data.bio ?? trainer.bio,
        specialties: data.specialties ?? trainer.specialties,
        upiId: data.upiId ?? trainer.paymentDetails?.upiId ?? '',
        bankAccount: data.bankAccount ?? trainer.paymentDetails?.bankAccount ?? '',
        ifscCode: data.ifscCode ?? trainer.paymentDetails?.ifscCode ?? '',
        profilePic: profilePicUrl,
      };

const updatedTrainer = await this.trainerRepository.updateProfile(trainerId, updateData);

      if (!updatedTrainer) {
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          error: {
            code: ERRORMESSAGES.TRAINER_NOT_FOUND.code,
            message: ERRORMESSAGES.TRAINER_NOT_FOUND.message,
          },
        };
      }

  

     const imageUrl = updatedTrainer.profilePic ? await this.s3Service.getPresignedUrl(updatedTrainer.profilePic) : null;

      return {
        success: true,
        status: HttpStatus.OK,
        data: { ...updatedTrainer.toJSON(), profilePic: imageUrl },
        message: MESSAGES.TRAINER_PROFILE_UPDATED,
      };
    } catch (error:any ) {
     console.error('[ERROR] Update Trainer Profile error:', error);
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: error.message.includes('TRAINER_PROFILE') ? error.message.split(':')[0] : ERRORMESSAGES.GENERIC_ERROR.code,
          message: error.message || ERRORMESSAGES.GENERIC_ERROR.message,
        },
      };
    }
  }
}