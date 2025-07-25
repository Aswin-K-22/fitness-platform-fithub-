import { ICreatePTPlanRequestDTO, IPTPlanRequestToEntity } from '@/domain/dtos/createPTPlanRequest.dto';
import { ICreatePTPlanResponseDTO } from '@/domain/dtos/createPTPlanResponse.dto';

export interface ICreatePTPlanUseCase {
  execute( data:IPTPlanRequestToEntity): Promise<ICreatePTPlanResponseDTO>;
}