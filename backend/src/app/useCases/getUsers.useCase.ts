import { IUsersRepository } from '../repositories/users.repository';
import { IGetUsersRequestDTO } from '../../domain/dtos/getUsersRequest.dto';
import { IGetUsersResponseDTO } from '../../domain/dtos/getUsersResponse.dto';
import { UserErrorType } from '../../domain/enums/userErrorType.enum';

export class GetUsersUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(params: IGetUsersRequestDTO): Promise<IGetUsersResponseDTO> {
    try {
      const users = await this.usersRepository.findAllUsers(params);
      const totalUsers = await this.usersRepository.countUsers(params);
      const totalPages = Math.ceil(totalUsers / params.limit);

      return {
        users,
        totalPages,
        totalUsers,
      };
    } catch (error) {
      throw new Error(UserErrorType.FailedToToggleVerification); // Generic error, can be customized
    }
  }
}