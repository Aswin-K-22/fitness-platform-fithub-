import { ITrainersRepository } from '../repositories/trainers.repository';
import { IGetTrainerProfileResponseDTO, TrainerProfile } from '../../domain/dtos/getTrainerProfileResponse.dto';
import { TrainerErrorType } from '../../domain/enums/trainerErrorType.enum';

export class GetTrainerProfileUseCase {
  constructor(private trainersRepository: ITrainersRepository) {}

  async execute(email: string): Promise<IGetTrainerProfileResponseDTO> {
    try {
      const trainer = await this.trainersRepository.findByEmail(email);
      if (!trainer) {
        return {
          success: false,
          error: TrainerErrorType.TrainerNotFound,
        };
      }

      const trainerProfile: TrainerProfile = {
        id: trainer.id ?? '',
        name: trainer.name,
        email: trainer.email.address,
        role: trainer.role,
        profilePic: trainer.profilePic,
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
              paymentHistory: trainer.paymentDetails.paymentHistory?.map((history) => ({
                paymentId: history.paymentId,
                amount: history.amount,
                date: history.date.toISOString(),
                periodStart: history.periodStart?.toISOString() ?? null,
                periodEnd: history.periodEnd?.toISOString() ?? null,
                clientCount: history.clientCount,
                hoursWorked: history.hoursWorked,
              })),
            }
          : null,
        availability: trainer.availability?.map((avail) => ({
          day: avail.day,
          startTime: avail.startTime,
          endTime: avail.endTime,
        })),
        gyms: trainer.gyms,
        createdAt: trainer.createdAt?.toISOString(),
        updatedAt: trainer.updatedAt?.toISOString(),
        verifiedByAdmin: trainer.verifiedByAdmin,
        certifications: trainer.certifications?.map((cert) => ({
          name: cert.name,
          issuer: cert.issuer,
          dateEarned: cert.dateEarned.toISOString(),
          filePath: cert.filePath,
        })),
        clients: trainer.clients?.map((client) => ({
          userId: client.userId,
          membershipId: client.membershipId,
          startDate: client.startDate.toISOString(),
          active: client.active,
        })),
      };

      return {
        success: true,
        trainer: trainerProfile,
      };
    } catch (error: any) {
      console.error('[ERROR] Get trainer profile error:', error);
      return {
        success: false,
        error: TrainerErrorType.InternalServerError,
      };
    }
  }
}