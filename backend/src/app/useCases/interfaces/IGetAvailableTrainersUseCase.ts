import { IGetAvailableTrainersResponseDTO } from '@/domain/dtos/getAvailableTrainersResponse.dto';

export interface IGetAvailableTrainersUseCase {
  execute(): Promise<IGetAvailableTrainersResponseDTO>;
}