import { IUsersRepository } from '@/app/repositories/users.repository';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { MESSAGES } from '@/domain/constants/messages.constant';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { IAdminGetResponseDTO } from '@/domain/dtos/adminGetResponse.dto';

export class GetAdminUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(email: string): Promise<IAdminGetResponseDTO> {
    try {
      const user = await this.usersRepository.findByEmail(email);
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

      if (user.role !== 'admin') {
        return {
          success: false,
          status: HttpStatus.FORBIDDEN,
          error: {
            code: ERRORMESSAGES.AUTH_INVALID_ROLE.code,
            message: ERRORMESSAGES.AUTH_INVALID_ROLE.message,
          },
        };
      }

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.SUCCESS,
        data: {
          user: {
            id: user.id!,
            email: user.email.address,
            name: user.name,
            role: user.role,
            profilePic: user.profilePic,
          },
        },
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