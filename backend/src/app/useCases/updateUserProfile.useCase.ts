import { IUsersRepository } from '../repositories/users.repository';
import { IUpdateUserProfileRequestDTO } from '../../domain/dtos/updateUserProfileRequest.dto';
import { IUpdateUserProfileResponseDTO } from '../../domain/dtos/updateUserProfileResponse.dto';
import { UserErrorType } from '../../domain/enums/userErrorType.enum';
import { User } from '../../domain/entities/User.entity';
import { Email } from '../../domain/valueObjects/email.valueObject';

export class UpdateUserProfileUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(email: string, data: IUpdateUserProfileRequestDTO): Promise<IUpdateUserProfileResponseDTO> {
    try {
      // Validate input
      if (!data.name && !data.profilePic) {
        return {
          success: false,
          error: UserErrorType.NoValidFieldsProvided,
        };
      }

      // Validate name if provided
      if (data.name) {
        if (data.name.length < 2) {
          return {
            success: false,
            error: UserErrorType.InvalidName,
          };
        }
        if (/\s{2,}/.test(data.name) || /^\s|\s$/.test(data.name)) {
          return {
            success: false,
            error: UserErrorType.InvalidNameFormat,
          };
        }
      }

      // Check if user exists
      const user = await this.usersRepository.findByEmail(email);
      if (!user) {
        return {
          success: false,
          error: UserErrorType.UserNotFound,
        };
      }

      // Update profile
     const updatedUser = await this.usersRepository.updateProfile(email, data);

     

      return {
        success: true,
        data: {
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email.address,
            password: updatedUser.password,
            role: updatedUser.role,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
            otp: updatedUser.otp,
            otpExpires: updatedUser.otpExpires,
            isVerified: updatedUser.isVerified,
            refreshToken: updatedUser.refreshToken,
            profilePic: updatedUser.profilePic,
            membershipId: updatedUser.membershipId,
            fitnessProfile: updatedUser.fitnessProfile,
            workoutPlanId: updatedUser.workoutPlanId,
            progress: updatedUser.progress,
            weeklySummary: updatedUser.weeklySummary,
            memberships: updatedUser.memberships,
            Bookings: updatedUser.Bookings,
            payments: updatedUser.payments,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: UserErrorType.UpdateProfileFailed,
      };
    }
  }
}