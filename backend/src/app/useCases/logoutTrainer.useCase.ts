import { ITrainersRepository } from '../repositories/trainers.repository';
import { ILogoutRequestDTO } from '../../domain/dtos/logoutRequest.dto';
import { ILogoutResponseDTO } from '../../domain/dtos/logoutResponse.dto';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import { ILogoutTrainerUseCase } from './interfaces/ILogoutTrainerUseCase';
import { ITokenService } from '../providers/token.service';
import * as jwt from 'jsonwebtoken';

export class LogoutTrainerUseCase implements ILogoutTrainerUseCase {
  constructor(
    private trainerRepository: ITrainersRepository,
    private tokenService: ITokenService
  ) {}

  async execute(data: ILogoutRequestDTO, accessToken?: string): Promise<ILogoutResponseDTO> {
    try {
      if (!data.email) {
        console.log('[DEBUG] Missing email in logout request');
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.AUTH_MISSING_EMAIL.code,
            message: ERRORMESSAGES.AUTH_MISSING_EMAIL.message,
          },
        };
      }

      console.log(`[DEBUG] Attempting logout for email: ${data.email}`);
      const trainer = await this.trainerRepository.findByEmail(data.email);
      if (!trainer) {
        console.log(`[DEBUG] Trainer not found for email: ${data.email}`);
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          error: {
            code: ERRORMESSAGES.TRAINER_NOT_FOUND.code,
            message: ERRORMESSAGES.TRAINER_NOT_FOUND.message,
          },
        };
      }

      if (accessToken) {
        const decoded = jwt.decode(accessToken) as { jti?: string } | null;
        if (decoded?.jti) {
          await this.tokenService.blacklistAccessToken(decoded.jti);
        }
      }

      await this.trainerRepository.updateRefreshToken(data.email, null);
      console.log(`[DEBUG] Refresh token cleared for email: ${data.email}`);

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.USER_LOGGED_OUT,
      };
    } catch (error) {
      console.error(`[ERROR] Logout failed for email: ${data.email}`, error);
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