import { IUsersRepository } from '../repositories/users.repository';
import { IAdminLogoutRequestDTO } from '../../domain/dtos/logoutAdminRequest.dto';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import { IAdminLogoutResponseDTO } from '@/domain/dtos/logoutAdminResponse.dto';

export class LogoutAdminUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(data: IAdminLogoutRequestDTO): Promise<IAdminLogoutResponseDTO> {
    try {
      const user = await this.usersRepository.findByEmail(data.email);
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

      if (user.role !== 'admin') {
        return {
          success: false,
          status: HttpStatus.FORBIDDEN,
          error: {
            code: ERRORMESSAGES.USER_INVALID_ROLE.code,
            message: ERRORMESSAGES.USER_INVALID_ROLE.message,
          },
        };
      }

      await this.usersRepository.updateRefreshToken(data.email, null);

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.USER_LOGGED_OUT,
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