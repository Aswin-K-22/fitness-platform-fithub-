import { IAdminLogoutRequestDTO } from '@/domain/dtos/logoutAdminRequest.dto';
import { IAdminLogoutResponseDTO } from '@/domain/dtos/logoutAdminResponse.dto';

export interface ILogoutAdminUseCase {
  execute(data: IAdminLogoutRequestDTO, accessToken?: string): Promise<IAdminLogoutResponseDTO>;
}