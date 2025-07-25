import { ITrainersRepository } from '../repositories/trainers.repository';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import { IGetTrainerProfileResponseDTO, TrainerProfile } from '../../domain/dtos/getTrainerProfileResponse.dto';
import { IGetTrainerProfileUseCase } from './interfaces/IGetTrainerProfileUseCase';
import { S3Service } from '@/infra/providers/s3.service';
import { Trainer } from '@/domain/entities/Trainer.entity';

export class GetTrainerProfileUseCase implements IGetTrainerProfileUseCase {
  constructor(
    private trainersRepository: ITrainersRepository,
    private readonly s3Service: S3Service
  ) {}

  private toTrainerProfileDTO(trainer: Trainer, profilePicUrl: string | null): TrainerProfile {
    return {
      id: trainer.id ?? '',
      name: trainer.name,
      email: trainer.email.address,
      role: trainer.role,
      profilePic: profilePicUrl ?? trainer.profilePic, // Use provided profilePicUrl or fallback to trainer.profilePic
      bio: trainer.bio,
      specialties: trainer.specialties,
      experienceLevel: trainer.experienceLevel,
      paymentDetails: trainer.paymentDetails
        ? {
            ifscCode: trainer.paymentDetails.ifscCode,
            bankAccount: trainer.paymentDetails.bankAccount,
            upiId: trainer.paymentDetails.upiId,
            method: trainer.paymentDetails.method,
            rate: trainer.paymentDetails.rate,
            currency: trainer.paymentDetails.currency,
            paymentHistory: trainer.paymentDetails.paymentHistory?.map((history: any) => ({
              paymentId: history.paymentId,
              amount: history.amount,
              date: history.date.toISOString(),
              periodStart: history.periodStart?.toISOString() ?? null,
              periodEnd: history.periodEnd?.toISOString() ?? null,
              clientCount: history.clientCount,
              hoursWorked: history.hoursWorked,
            })) ?? [],
          }
        : null,
      availability: trainer.availability?.map((avail: any) => ({
        day: avail.day,
        startTime: avail.startTime,
        endTime: avail.endTime,
      })) ?? [],
      gyms: trainer.gyms ?? [],
      createdAt: trainer.createdAt?.toISOString(),
      updatedAt: trainer.updatedAt?.toISOString(),
      verifiedByAdmin: trainer.verifiedByAdmin,
      certifications: trainer.certifications?.map((cert: any) => ({
        name: cert.name,
        issuer: cert.issuer,
        dateEarned: cert.dateEarned.toISOString(),
        filePath: cert.filePath,
      })) ?? [],
      clients: trainer.clients?.map((client: any) => ({
        userId: client.userId,
        membershipId: client.membershipId,
        startDate: client.startDate.toISOString(),
        active: client.active,
      })) ?? [],
    };
  }

  async execute(email: string): Promise<IGetTrainerProfileResponseDTO> {
    try {
      if (!email) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.AUTH_MISSING_EMAIL.code,
            message: ERRORMESSAGES.AUTH_MISSING_EMAIL.message,
          },
        };
      }

      const trainer = await this.trainersRepository.findByEmail(email);
      console.log(trainer?.email.address, 'This is trainer email address [trainer.email.address]');
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
      if (profilePicUrl && profilePicUrl.startsWith('trainer-profiles/')) {
        profilePicUrl = await this.s3Service.getPresignedUrl(profilePicUrl) || trainer.profilePic;
      }

      const trainerProfile = this.toTrainerProfileDTO(trainer, profilePicUrl);
      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.SUCCESS,
        data: { trainer: trainerProfile },
      };
    } catch (error: any) {
      console.error('[ERROR] Get trainer profile error:', error);
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: ERRORMESSAGES.GENERIC_ERROR.code,
          message: error.message || ERRORMESSAGES.GENERIC_ERROR.message,
        },
      };
    }
  }
}