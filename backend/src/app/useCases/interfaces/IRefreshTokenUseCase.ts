import { IRefreshTokenRequestDTO } from '@/domain/dtos/refreshTokenRequest.dto';
import { IRefreshTokenResponseDTO } from '@/domain/dtos/refreshTokenResponse.dto';

export interface IRefreshTokenUseCase {
  execute(data: IRefreshTokenRequestDTO): Promise<IRefreshTokenResponseDTO>;
}