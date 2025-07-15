import { GetAdminGymsRequestDTO } from '@/domain/dtos/getAdminGymsRequest.dto';
import { IGetAdminGymsResponseDTO } from '@/domain/dtos/getAdminGymsResponse.dto';

export interface IGetAdminGymsUseCase {
  execute(data: GetAdminGymsRequestDTO): Promise<IGetAdminGymsResponseDTO>;
}