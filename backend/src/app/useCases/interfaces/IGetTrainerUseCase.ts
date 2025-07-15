import { IGetTrainerResponseDTO } from '@/domain/dtos/getTrainerResponse.dto';

export interface IGetTrainerUseCase {
  execute(email: string): Promise<IGetTrainerResponseDTO>;
}