import { IUsersRepository } from '../repositories/users.repository';
import { User } from '../../domain/entities/User.entity';
import { ILoginRequestDTO } from '../../domain/dtos/loginRequest.dto';
import { IPasswordHasher } from '../providers/passwordHasher.service';
import { ITokenService } from '../providers/token.service';
import { ILoginResponseDTO } from '../../domain/dtos/loginResponse.dto';
import { UserAuthResponseDTO } from '../../domain/dtos/userAuthResponse.dto';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import { ILoginUserUseCase } from './interfaces/ILoginUserUseCase';

export class LoginUserUseCase implements ILoginUserUseCase {
  constructor(
    private userRepository: IUsersRepository,
    private passwordHasher: IPasswordHasher,
    private tokenService: ITokenService,
  ) {}

  async execute(data: ILoginRequestDTO): Promise<ILoginResponseDTO> {
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

      const user = await this.userRepository.findByEmail(data.email);
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

      const accessToken = await this.tokenService.generateAccessToken({ email: user.email.address, id: user.id });
      const refreshToken = await this.tokenService.generateRefreshToken({ email: user.email.address, id: user.id });
      await this.userRepository.updateRefreshToken(data.email, refreshToken);

      const userAuth: UserAuthResponseDTO = {
        id: user.id || '',
        email: user.email.address,
        name: user.name,
        role: user.role as 'user' | 'admin' | 'trainer',
        profilePic: user.profilePic || null,
        isVerified: user.isVerified || false,
      };

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.USER_LOGGED_IN,
        data: { user: userAuth, accessToken, refreshToken },
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