import { GetGymsRequestDTO } from '@/domain/dtos/getGymsRequest.dto';
import { IGetGymsResponseDTO } from '@/domain/dtos/getGymsResponse.dto';

export interface IGetGymsUseCase {
  execute(data: GetGymsRequestDTO): Promise<IGetGymsResponseDTO>;
}