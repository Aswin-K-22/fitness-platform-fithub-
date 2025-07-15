import { IGetUserResponseDTO } from '@/domain/dtos/getUserResponse.dto';

export interface IGetUserUseCase {
  execute(email: string): Promise<IGetUserResponseDTO>;
}