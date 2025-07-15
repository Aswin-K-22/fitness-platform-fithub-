import { IGoogleAuthRequestDTO } from '@/domain/dtos/googleAuthRequest.dto';
import { IGoogleAuthResponseDTO } from '@/domain/dtos/googleAuthResponse.dto';

export interface IGoogleAuthUseCase {
  execute(data: IGoogleAuthRequestDTO): Promise<IGoogleAuthResponseDTO>;
}