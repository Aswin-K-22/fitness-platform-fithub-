import { IToggleUserVerificationRequestDTO } from '@/domain/dtos/toggleUserVerificationRequest.dto';
import { IToggleUserVerificationResponseDTO } from '@/domain/dtos/toggleUserVerificationResponse.dto';

export interface IToggleUserVerificationUseCase {
  execute(data: IToggleUserVerificationRequestDTO): Promise<IToggleUserVerificationResponseDTO>;
}