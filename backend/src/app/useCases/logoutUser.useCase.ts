import { IUsersRepository } from '../repositories/users.repository';
import { ILogoutRequestDTO } from '../../domain/dtos/logoutRequest.dto';
import { ILogoutUserResponseDTO } from '@/domain/dtos/logoutUserResponse.dto';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';

export class LogoutUserUseCase {
  constructor(private userRepository: IUsersRepository) {}

  async execute(data: ILogoutRequestDTO): Promise<ILogoutUserResponseDTO> {
    try {
      const user = await this.userRepository.findByEmail(data.email);
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

      await this.userRepository.updateRefreshToken(data.email, null);

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