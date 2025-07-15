import { IRefreshTokenRequestDTO } from '@/domain/dtos/refreshTokenRequest.dto';
import { ITrainerRefreshTokenResponseDTO } from '@/domain/dtos/trainerRefreshTokenResponse.dto';

export interface ITrainerRefreshTokenUseCase {
  execute(dto: IRefreshTokenRequestDTO): Promise<ITrainerRefreshTokenResponseDTO>;
}