import { ILogoutRequestDTO } from '@/domain/dtos/logoutRequest.dto';
import { ILogoutUserResponseDTO } from '@/domain/dtos/logoutUserResponse.dto';

export interface ILogoutUserUseCase {
  execute(data: ILogoutRequestDTO, accessToken?: string): Promise<ILogoutUserResponseDTO>;
}