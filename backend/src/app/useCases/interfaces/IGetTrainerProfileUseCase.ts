import { IGetTrainerProfileResponseDTO } from '@/domain/dtos/getTrainerProfileResponse.dto';

export interface IGetTrainerProfileUseCase {
  execute(email: string): Promise<IGetTrainerProfileResponseDTO>;
}