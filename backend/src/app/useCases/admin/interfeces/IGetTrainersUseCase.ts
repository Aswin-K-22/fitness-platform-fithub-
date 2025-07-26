import { IAdminTrainersRequestDTO } from '@/domain/dtos/admin/adminTrainersRequestDTO';
import { IGetTrainersResponseDTO } from '@/domain/dtos/getTrainersResponse.dto';

export interface IGetTrainersUseCase {
  execute(data:  IAdminTrainersRequestDTO): Promise<IGetTrainersResponseDTO>;
}