import { IUsersRepository } from '../repositories/users.repository';
import { IUpdateUserProfileRequestDTO } from '../../domain/dtos/updateUserProfileRequest.dto';
import { IUpdateUserProfileResponseDTO } from '../../domain/dtos/updateUserProfileResponse.dto';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import { IUpdateUserProfileUseCase } from './interfaces/IUpdateUserProfileUseCase';

export class UpdateUserProfileUseCase implements IUpdateUserProfileUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(email: string, data: IUpdateUserProfileRequestDTO): Promise<IUpdateUserProfileResponseDTO> {
    try {
      // Validate input
      if (!data.name && !data.profilePic) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.USER_NO_VALID_FIELDS_PROVIDED.code,
            message: ERRORMESSAGES.USER_NO_VALID_FIELDS_PROVIDED.message,
          },
        };
      }

      // Validate name if provided
      if (data.name) {
        if (data.name.length < 2) {
          return {
            success: false,
            status: HttpStatus.BAD_REQUEST,
            error: {
              code: ERRORMESSAGES.USER_INVALID_NAME.code,
              message: ERRORMESSAGES.USER_INVALID_NAME.message,
            },
          };
        }
        if (/\s{2,}/.test(data.name) || /^\s|\s$/.test(data.name)) {
          return {
            success: false,
            status: HttpStatus.BAD_REQUEST,
            error: {
              code: ERRORMESSAGES.USER_INVALID_NAME_FORMAT.code,
              message: ERRORMESSAGES.USER_INVALID_NAME_FORMAT.message,
            },
          };
        }
      }

      // Check if user exists
      const user = await this.usersRepository.findByEmail(email);
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

      // Update profile
      const updatedUser = await this.usersRepository.updateProfile(email, data);

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.PROFILE_UPDATED,
        data: { user: updatedUser },
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