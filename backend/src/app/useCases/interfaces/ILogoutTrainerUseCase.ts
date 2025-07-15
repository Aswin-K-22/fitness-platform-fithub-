import { ILogoutRequestDTO } from '@/domain/dtos/logoutRequest.dto';
import { ILogoutResponseDTO } from '@/domain/dtos/logoutResponse.dto';

export interface ILogoutTrainerUseCase {
  execute(data: ILogoutRequestDTO): Promise<ILogoutResponseDTO>;
}