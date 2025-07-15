import { IUsersRepository } from '../repositories/users.repository';
import { IAdminLogoutRequestDTO } from '../../domain/dtos/logoutAdminRequest.dto';
import { IAdminLogoutResponseDTO } from '../../domain/dtos/logoutAdminResponse.dto';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import { ILogoutAdminUseCase } from './interfaces/ILogoutAdminUseCase';
import { ITokenService } from '../providers/token.service';
import * as jwt from 'jsonwebtoken';

export class LogoutAdminUseCase implements ILogoutAdminUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private tokenService: ITokenService
  ) {}

  async execute(data: IAdminLogoutRequestDTO, accessToken?: string): Promise<IAdminLogoutResponseDTO> {
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

      if (accessToken) {
        const decoded = jwt.decode(accessToken) as { jti?: string } | null;
        if (decoded?.jti) {
          await this.tokenService.blacklistAccessToken(decoded.jti);
        }
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