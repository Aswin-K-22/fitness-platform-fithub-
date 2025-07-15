import { IForgotPasswordRequestDTO } from '@/domain/dtos/forgotPasswordRequest.dto';
import { IForgotPasswordResponseDTO } from '@/domain/dtos/forgotPasswordResponse.dto';

export interface IForgotPasswordUseCase {
  execute(data: IForgotPasswordRequestDTO): Promise<IForgotPasswordResponseDTO>;
}