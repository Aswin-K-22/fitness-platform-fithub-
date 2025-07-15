import { IGetTrainersRequestDTO } from '@/domain/dtos/getTrainersRequest.dto';
import { IGetTrainersResponseDTO } from '@/domain/dtos/getTrainersResponse.dto';

export interface IGetTrainersUseCase {
  execute(data: IGetTrainersRequestDTO): Promise<IGetTrainersResponseDTO>;
}