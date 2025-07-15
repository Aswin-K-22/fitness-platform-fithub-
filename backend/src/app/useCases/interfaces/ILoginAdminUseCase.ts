import { IAdminLoginRequestDTO } from '@/domain/dtos/adminLoginRequest.dto';
import { IAdminLoginResponseDTO } from '@/domain/dtos/adminLoginResponse.dto';

export interface ILoginAdminUseCase {
  execute(data: IAdminLoginRequestDTO): Promise<IAdminLoginResponseDTO>;
}