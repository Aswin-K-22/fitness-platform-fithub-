import { IUsersRepository } from '../repositories/users.repository';
import { ILogoutRequestDTO } from '@/domain/dtos/logoutRequest.dto';
import { ILogoutUserResponseDTO } from '@/domain/dtos/logoutUserResponse.dto';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { MESSAGES } from '@/domain/constants/messages.constant';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { ILogoutUserUseCase } from './interfaces/ILogoutUserUseCase';
import { ITokenService } from '../providers/token.service';
import * as jwt from 'jsonwebtoken';

export class LogoutUserUseCase implements ILogoutUserUseCase {
  constructor(private userRepository: IUsersRepository, private tokenService: ITokenService) {}

  async execute(data: ILogoutRequestDTO, accessToken?: string): Promise<ILogoutUserResponseDTO> {
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

      if (accessToken) {
        const decoded = jwt.decode(accessToken) as { jti?: string } | null;
        if (decoded?.jti) {
          await this.tokenService.blacklistAccessToken(decoded.jti);
        }
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