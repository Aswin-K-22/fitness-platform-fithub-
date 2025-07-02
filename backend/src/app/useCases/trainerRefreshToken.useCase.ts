import { ITrainersRepository } from '../repositories/trainers.repository';
import { ITokenService } from '../providers/token.service';
import { IRefreshTokenRequestDTO } from '../../domain/dtos/refreshTokenRequest.dto';
import { TrainerErrorType } from '../../domain/enums/trainerErrorType.enum';
import { Trainer } from '../../domain/entities/Trainer.entity';
import {  TrainerAuth } from '@/domain/dtos/getTrainerResponse.dto';


interface RefreshTokenResponse  {
  success: boolean;
  error?: string;
  data?: {
    trainer: TrainerAuth;
    accessToken: string;
    refreshToken: string;
  };
}



export class TrainerRefreshTokenUseCase {
  constructor(
    private trainersRepository: ITrainersRepository,
    private tokenService: ITokenService
  ) {}

  async execute(dto: IRefreshTokenRequestDTO): Promise<RefreshTokenResponse> {
    try {
      if (!dto.refreshToken) {
        return { success: false, error: TrainerErrorType.NoRefreshTokenProvided };
      }

      const decoded = await this.tokenService.verifyRefreshToken(dto.refreshToken);
      if (!decoded.email) {
        return { success: false, error: TrainerErrorType.InvalidRefreshToken };
      }

      const trainer = await this.trainersRepository.findById(decoded.id);
      if (!trainer) {
        return { success: false, error: TrainerErrorType.TrainerNotFound };
      }

      if (trainer.refreshToken !== dto.refreshToken) {
        return { success: false, error: TrainerErrorType.InvalidRefreshToken };
      }

      const newAccessToken = await this.tokenService.generateAccessToken({
        id: trainer.id!,
        email: trainer.email.address,
      });
      const newRefreshToken = await this.tokenService.generateRefreshToken({
        id: trainer.id!,
        email: trainer.email.address,
      });

      await this.trainersRepository.updateRefreshToken(trainer.email.address, newRefreshToken);

      const trainerResponse: TrainerAuth = {
        id: trainer.id!,
        email: trainer.email.address,
        name: trainer.name,
        role: trainer.role,
        profilePic: trainer.profilePic || null,
        isVerified: trainer.isVerified,
        verifiedByAdmin: trainer.verifiedByAdmin,
      };

      return {
        success: true,
        data: {
          trainer: trainerResponse,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      };
    } catch (error: any) {
      console.error('[ERROR] Trainer refresh token error:', error);
      return { success: false, error: TrainerErrorType.InvalidRefreshToken };
    }
  }
}