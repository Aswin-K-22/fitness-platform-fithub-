import { ITrainersRepository } from '../repositories/trainers.repository';
import { TrainerErrorType } from '../../domain/enums/trainerErrorType.enum';
import { IUpdateTrainerProfileRequestDTO } from '@/domain/enums/updateTrainerProfileRequest.dto';
import { IUpdateTrainerProfileResponseDTO, TrainerProfile } from '@/domain/enums/updateTrainerProfileResponse.dto';

export class UpdateTrainerProfileUseCase {
  constructor(private trainersRepository: ITrainersRepository) {}

  async execute(email: string, data: IUpdateTrainerProfileRequestDTO): Promise<IUpdateTrainerProfileResponseDTO> {
    try {
      // Validation
      if (!data.name && !data.bio && !data.specialties && !data.profilePic && !data.upiId && !data.bankAccount && !data.ifscCode) {
        return {
          success: false,
          error: TrainerErrorType.NoValidFieldsProvided,
        };
      }

      if (data.name && (!data.name.trim() || data.name.length < 2 || data.name.length > 50)) {
        return {
          success: false,
          error: TrainerErrorType.InvalidName,
        };
      }

      if (data.bio && (!data.bio.trim() || data.bio.length > 500)) {
        return {
          success: false,
          error: TrainerErrorType.InvalidBio,
        };
      }

      if (data.specialties && (data.specialties.length === 0 || data.specialties.length > 5)) {
        return {
          success: false,
          error: TrainerErrorType.InvalidSpecialties,
        };
      }

      if (data.upiId && !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(data.upiId)) {
        return {
          success: false,
          error: TrainerErrorType.InvalidUpiId,
        };
      }

      if (data.bankAccount && !/^\d{9,18}$/.test(data.bankAccount)) {
        return {
          success: false,
          error: TrainerErrorType.InvalidBankAccount,
        };
      }

      if (data.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.ifscCode)) {
        return {
          success: false,
          error: TrainerErrorType.InvalidIfscCode,
        };
      }

      // Ensure bankAccount and ifscCode are both provided or both omitted
      if ((data.bankAccount || data.ifscCode) && !(data.bankAccount && data.ifscCode)) {
        return {
          success: false,
          error: TrainerErrorType.MissingBankDetails,
        };
      }

      // Remove undefined fields to prevent Prisma errors
      const cleanedData: IUpdateTrainerProfileRequestDTO = {
        name: data.name,
        bio: data.bio,
        specialties: data.specialties,
        profilePic: data.profilePic,
        upiId: data.upiId !== undefined ? data.upiId : undefined,
        bankAccount: data.bankAccount !== undefined ? data.bankAccount : undefined,
        ifscCode: data.ifscCode !== undefined ? data.ifscCode : undefined,
      };

      // Fetch existing trainer
      const trainer = await this.trainersRepository.findByEmail(email);
      if (!trainer) {
        return {
          success: false,
          error: TrainerErrorType.TrainerNotFound,
        };
      }

      // Update profile
      const updatedTrainer = await this.trainersRepository.updateProfile(email, cleanedData);

      // Map to response DTO
      const trainerProfile: TrainerProfile = {
        id: updatedTrainer.id ?? '',
        name: updatedTrainer.name,
        email: updatedTrainer.email.address,
        role: updatedTrainer.role,
        profilePic: updatedTrainer.profilePic,
        bio: updatedTrainer.bio,
        specialties: updatedTrainer.specialties,
        experienceLevel: updatedTrainer.experienceLevel,
        paymentDetails: updatedTrainer.paymentDetails
          ? {
              ifscCode: updatedTrainer.paymentDetails.ifscCode,
              bankAccount: updatedTrainer.paymentDetails.bankAccount,
              upiId: updatedTrainer.paymentDetails.upiId,
              method: updatedTrainer.paymentDetails.method,
              rate: updatedTrainer.paymentDetails.rate,
              currency: updatedTrainer.paymentDetails.currency,
              paymentHistory: updatedTrainer.paymentDetails.paymentHistory?.map((history) => ({
                paymentId: history.paymentId,
                amount: history.amount,
                date: history.date.toISOString(),
                periodStart: history.periodStart?.toISOString(),
                periodEnd: history.periodEnd?.toISOString(),
                clientCount: history.clientCount,
                hoursWorked: history.hoursWorked,
              })),
            }
          : undefined,
        availability: updatedTrainer.availability?.map((avail) => ({
          day: avail.day,
          startTime: avail.startTime,
          endTime: avail.endTime,
        })),
        gyms: updatedTrainer.gyms,
        createdAt: updatedTrainer.createdAt?.toISOString(),
        updatedAt: updatedTrainer.updatedAt?.toISOString(),
        verifiedByAdmin: updatedTrainer.verifiedByAdmin,
        certifications: updatedTrainer.certifications?.map((cert) => ({
          name: cert.name,
          issuer: cert.issuer,
          dateEarned: cert.dateEarned.toISOString(),
          filePath: cert.filePath,
        })),
        clients: updatedTrainer.clients?.map((client) => ({
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
      console.error('[ERROR] Update trainer profile error:', error);
      return {
        success: false,
        error: error.message === TrainerErrorType.InternalServerError
          ? TrainerErrorType.InternalServerError
          : TrainerErrorType.UpdateFailed,
      };
    }
  }
}