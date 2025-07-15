import { ILoginRequestDTO } from '@/domain/dtos/loginRequest.dto';
import { ILoginTrainerResponseDTO } from '@/domain/dtos/trainerLoginResponse.dto';

export interface ILoginTrainerUseCase {
  execute(data: ILoginRequestDTO): Promise<ILoginTrainerResponseDTO>;
}