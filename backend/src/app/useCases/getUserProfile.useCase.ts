import { IUsersRepository } from '../repositories/users.repository';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import { IGetUserProfileResponseDTO } from '@/domain/dtos/getUserProfile.dto';
import { UserProfileDataDTO } from '@/domain/dtos/getUserProfileResoponse.dto';

export class GetUserProfileUseCase {
  constructor(private userRepository: IUsersRepository) {}

  async execute(email: string): Promise<IGetUserProfileResponseDTO> {
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

      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          error: {
            code: ERRORMESSAGES.USER_NOT_FOUND.code,
            message: ERRORMESSAGES.USER_NOT_FOUND.message,
          },
        };
      }

      const userAuth: UserProfileDataDTO = {
        id: user.id,
        email: user.email.address,
        name: user.name,
        role: user.role as 'user' | 'admin' | 'trainer',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profilePic: user.profilePic || null,
        fitnessProfile: user.fitnessProfile || {},
        progress: user.progress || [],
        weeklySummary: user.weeklySummary || [],
        memberships: user.memberships || [],
        Bookings: user.Bookings || [],
        payments: user.payments || [],
      };

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.SUCCESS,
        data: { user: userAuth },
      };
    } catch (error) {
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: ERRORMESSAGES.GENERIC_ERROR.code,
          message: ERRORMESSAGES.GENERIC_ERROR.message,
        },
      };
    }
  }
}