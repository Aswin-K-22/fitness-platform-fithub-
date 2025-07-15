import { IUpdateTrainerProfileRequestDTO } from '@/domain/dtos/updateTrainerProfileRequest.dto';
import { IUpdateTrainerProfileResponseDTO } from '@/domain/dtos/updateTrainerProfileResponse.dto';

export interface IUpdateTrainerProfileUseCase {
  execute(email: string, data: IUpdateTrainerProfileRequestDTO): Promise<IUpdateTrainerProfileResponseDTO>;
}