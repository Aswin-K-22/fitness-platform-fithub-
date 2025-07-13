import { IUsersRepository } from '../repositories/users.repository';
import { IPasswordHasher } from '../providers/passwordHasher.service';
import { ITokenService } from '../providers/token.service';
import { IAdminLoginRequestDTO } from '../../domain/dtos/adminLoginRequest.dto';
import { IAdminLoginResponseDTO } from '../../domain/dtos/adminLoginResponse.dto';
import { User } from '../../domain/entities/User.entity';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';

export class LoginAdminUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private passwordHasher: IPasswordHasher,
    private tokenService: ITokenService,
  ) {}

  async execute(data: IAdminLoginRequestDTO): Promise<IAdminLoginResponseDTO> {
    try {
      if (!data.email || !data.password) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.AUTH_MISSING_REQUIRED_FIELDS.code,
            message: ERRORMESSAGES.AUTH_MISSING_REQUIRED_FIELDS.message,
          },
        };
      }

      const user = await this.usersRepository.findByEmail(data.email);
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

      if (!user.isVerified) {
        return {
          success: false,
          status: HttpStatus.FORBIDDEN,
          error: {
            code: ERRORMESSAGES.USER_NOT_VERIFIED.code,
            message: ERRORMESSAGES.USER_NOT_VERIFIED.message,
          },
        };
      }

      if (!user.password) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.AUTH_INVALID_CREDENTIALS.code,
            message: ERRORMESSAGES.AUTH_INVALID_CREDENTIALS.message,
          },
        };
      }

      const isPasswordValid = await this.passwordHasher.comparePasswords(data.password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          status: HttpStatus.UNAUTHORIZED,
          error: {
            code: ERRORMESSAGES.AUTH_INVALID_CREDENTIALS.code,
            message: ERRORMESSAGES.AUTH_INVALID_CREDENTIALS.message,
          },
        };
      }

      const accessToken = await this.tokenService.generateAccessToken({ email: user.email.address, id: user.id! });
      const refreshToken = await this.tokenService.generateRefreshToken({ email: user.email.address, id: user.id! });
      await this.usersRepository.updateRefreshToken(user.email.address, refreshToken);

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.USER_LOGGED_IN,
        data: {
          user: {
            id: user.id!,
            email: user.email.address,
            name: user.name,
            role: user.role,
          },
          accessToken,
          refreshToken,
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