import { IAdminRefreshTokenRequestDTO } from '@/domain/dtos/adminRefreshTokenRequest.dto';
import { IAdminLoginResponseDTO } from '@/domain/dtos/adminLoginResponse.dto';

export interface IAdminRefreshTokenUseCase {
  execute(data: IAdminRefreshTokenRequestDTO): Promise<IAdminLoginResponseDTO>;
}