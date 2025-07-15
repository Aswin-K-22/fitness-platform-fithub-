import { ICreateUserRequestDTO } from '@/domain/dtos/createUserRequest.dto';
import { ICreateUserResponseDTO } from '@/domain/dtos/createUserResponse.dto';

export interface ICreateUserUseCase {
  execute(data: ICreateUserRequestDTO): Promise<ICreateUserResponseDTO>;
}