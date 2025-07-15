import { ILoginRequestDTO } from '@/domain/dtos/loginRequest.dto';
import { ILoginResponseDTO } from '@/domain/dtos/loginResponse.dto';

export interface ILoginUserUseCase {
  execute(data: ILoginRequestDTO): Promise<ILoginResponseDTO>;
}