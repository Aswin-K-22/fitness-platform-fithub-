import { IUsersRepository } from '../repositories/users.repository';
import { IGetUserResponseDTO, UserAuthResponseDTO } from '../../domain/dtos/getUserResponse.dto';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import { IGetUserUseCase } from './interfaces/IGetUserUseCase';

export class GetUserUseCase implements IGetUserUseCase {
  constructor(private userRepository: IUsersRepository) {}

  async execute(email: string): Promise<IGetUserResponseDTO> {
    try {
      if (!email) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.AUTH_MISSING_EMAIL.code,
            message: ERRORMESSAGES.AUTH_MISSING_EMAIL.message,
          },
        };
      }

      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          error: {
            code: ERRORMESSAGES.USER_NOT_FOUND.code,
            message: ERRORMESSAGES.USER_NOT_FOUND.message,
          },
        };
      }

      const userAuth: UserAuthResponseDTO = {
        id: user.id || '',
        email: user.email.address,
        name: user.name,
        role: user.role as 'user' | 'admin' | 'trainer',
        profilePic: user.profilePic,
        isVerified: user.isVerified,
      };

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.SUCCESS,
        data: { user: userAuth },
      };
    } catch (error) {
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: ERRORMESSAGES.GENERIC_ERROR.code,
          message: ERRORMESSAGES.GENERIC_ERROR.message,
        },
      };
    }
  }
}