import { ICreateTrainerRequestDTO } from '@/domain/dtos/createTrainerRequest.dto';
import { ICreateTrainerResponseDTO } from '@/domain/dtos/createTrainerResponse.dto';

export interface ICreateTrainerUseCase {
  execute(data: ICreateTrainerRequestDTO): Promise<ICreateTrainerResponseDTO>;
}