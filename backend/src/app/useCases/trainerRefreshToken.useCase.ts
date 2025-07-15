import { ITrainersRepository } from '../repositories/trainers.repository';
import { ITokenService } from '../providers/token.service';
import { IRefreshTokenRequestDTO } from '../../domain/dtos/refreshTokenRequest.dto';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import { ITrainerRefreshTokenResponseDTO } from '../../domain/dtos/trainerRefreshTokenResponse.dto';
import { TrainerAuth } from '../../domain/dtos/getTrainerResponse.dto';
import { ITrainerRefreshTokenUseCase } from './interfaces/ITrainerRefreshTokenUseCase';

export class TrainerRefreshTokenUseCase implements ITrainerRefreshTokenUseCase {
  constructor(
    private trainersRepository: ITrainersRepository,
    private tokenService: ITokenService,
  ) {}

  async execute(dto: IRefreshTokenRequestDTO): Promise<ITrainerRefreshTokenResponseDTO> {
    try {
      if (!dto.refreshToken) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.TRAINER_NO_REFRESH_TOKEN_PROVIDED.code,
            message: ERRORMESSAGES.TRAINER_NO_REFRESH_TOKEN_PROVIDED.message,
          },
        };
      }

      const decoded = await this.tokenService.verifyRefreshToken(dto.refreshToken);
      if (!decoded.email || !decoded.id) {
        console.log('Invalid refresh token - email:', decoded.email, 'ID:', decoded.id);
        return {
          success: false,
          status: HttpStatus.UNAUTHORIZED,
          error: {
            code: ERRORMESSAGES.TRAINER_INVALID_REFRESH_TOKEN.code,
            message: ERRORMESSAGES.TRAINER_INVALID_REFRESH_TOKEN.message,
          },
        };
      }

      const trainer = await this.trainersRepository.findById(decoded.id);
      if (!trainer) {
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          error: {
            code: ERRORMESSAGES.TRAINER_NOT_FOUND.code,
            message: ERRORMESSAGES.TRAINER_NOT_FOUND.message,
          },
        };
      }

      if (trainer.refreshToken !== dto.refreshToken) {
        console.log(
          'Invalid refresh token - ID:',
          decoded.id,
          'trainerDB refreshToken equals cookie refreshToken:',
          trainer.refreshToken === dto.refreshToken,
        );
        return {
          success: false,
          status: HttpStatus.UNAUTHORIZED,
          error: {
            code: ERRORMESSAGES.TRAINER_INVALID_REFRESH_TOKEN.code,
            message: ERRORMESSAGES.TRAINER_INVALID_REFRESH_TOKEN.message,
          },
        };
      }

      const accessToken = await this.tokenService.generateAccessToken({
        id: trainer.id!,
        email: trainer.email.address,
      });
      const refreshToken = await this.tokenService.generateRefreshToken({
        id: trainer.id!,
        email: trainer.email.address,
      });

      await this.trainersRepository.updateRefreshToken(trainer.email.address, refreshToken);

      const trainerResponse: TrainerAuth = {
        id: trainer.id!,
        email: trainer.email.address,
        name: trainer.name,
        role: trainer.role,
        profilePic: trainer.profilePic || null,
        isVerified: trainer.isVerified || false,
        verifiedByAdmin: trainer.verifiedByAdmin || false,
      };

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.USER_LOGGED_IN,
        data: {
          trainer: trainerResponse,
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      console.error('[ERROR] TrainerRefreshTokenUseCase error:', error);
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