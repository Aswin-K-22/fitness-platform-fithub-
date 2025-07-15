import { IUsersRepository } from '../repositories/users.repository';
import { IGetUsersRequestDTO } from '../../domain/dtos/getUsersRequest.dto';
import { IGetUsersResponseDTO } from '../../domain/dtos/getUsersResponse.dto';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import { IGetUsersUseCase } from './interfaces/IGetUsersUseCase';

export class GetUsersUseCase implements IGetUsersUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(params: IGetUsersRequestDTO): Promise<IGetUsersResponseDTO> {
    try {
      const users = await this.usersRepository.findAllUsers(params);
      const totalUsers = await this.usersRepository.countUsers(params);
      const totalPages = Math.ceil(totalUsers / params.limit);

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.SUCCESS,
        data: { users, totalPages, totalUsers },
      };
    } catch (error) {
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: ERRORMESSAGES.USER_FAILED_TO_FETCH_USERS.code,
          message: ERRORMESSAGES.USER_FAILED_TO_FETCH_USERS.message,
        },
      };
    }
  }
}