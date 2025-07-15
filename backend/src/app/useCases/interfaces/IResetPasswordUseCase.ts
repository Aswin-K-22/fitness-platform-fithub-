import { IResetPasswordRequestDTO } from '@/domain/dtos/resetPasswordRequest.dto';
import { IResetPasswordResponseDTO } from '@/domain/dtos/resetPasswordResponse.dto';

export interface IResetPasswordUseCase {
  execute(data: IResetPasswordRequestDTO): Promise<IResetPasswordResponseDTO>;
}