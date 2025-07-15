import { IGetUsersRequestDTO } from '@/domain/dtos/getUsersRequest.dto';
import { IGetUsersResponseDTO } from '@/domain/dtos/getUsersResponse.dto';

export interface IGetUsersUseCase {
  execute(params: IGetUsersRequestDTO): Promise<IGetUsersResponseDTO>;
}