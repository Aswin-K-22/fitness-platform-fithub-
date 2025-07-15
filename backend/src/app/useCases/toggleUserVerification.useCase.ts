import { IUsersRepository } from '../repositories/users.repository';
import { IToggleUserVerificationRequestDTO } from '../../domain/dtos/toggleUserVerificationRequest.dto';
import { IToggleUserVerificationResponseDTO } from '../../domain/dtos/toggleUserVerificationResponse.dto';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import { UserAuthResponseDTO } from '../../domain/dtos/userAuthResponse.dto';
import { IToggleUserVerificationUseCase } from './interfaces/IToggleUserVerificationUseCase';

export class ToggleUserVerificationUseCase implements IToggleUserVerificationUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(data: IToggleUserVerificationRequestDTO): Promise<IToggleUserVerificationResponseDTO> {
    try {
      if (!data.userId) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.USER_MISSING_REQUIRED_FIELDS.code,
            message: ERRORMESSAGES.USER_MISSING_REQUIRED_FIELDS.message,
          },
        };
      }

      const user = await this.usersRepository.toggleUserVerification(data.userId);
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

      const userAuth: UserAuthResponseDTO = {
        id: user.id || '',
        email: user.email.address,
        name: user.name,
        role: user.role as 'user' | 'admin' | 'trainer',
        profilePic: user.profilePic || null,
        isVerified: user.isVerified || false,
      };

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.OTP_VERIFIED,
        data: { user: userAuth },
      };
    } catch (error) {
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: ERRORMESSAGES.USER_FAILED_TO_TOGGLE_VERIFICATION.code,
          message: ERRORMESSAGES.USER_FAILED_TO_TOGGLE_VERIFICATION.message,
        },
      };
    }
  }
}