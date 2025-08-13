import { IUsersRepository } from '../repositories/users.repository';
import { User } from '../../domain/entities/User.entity';
import { IGoogleAuthRequestDTO } from '../../domain/dtos/googleAuthRequest.dto';
import { ITokenService } from '../providers/token.service';
import { IGoogleAuthService } from '../providers/googleAuth.service';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import { UserAuthResponseDTO } from '../../domain/dtos/userAuthResponse.dto';
import { IGoogleAuthResponseDTO } from '@/domain/dtos/googleAuthResponse.dto';
import { IGoogleAuthUseCase } from './interfaces/IGoogleAuthUseCase';

export class GoogleAuthUseCase implements IGoogleAuthUseCase {
  constructor(
    private userRepository: IUsersRepository,
    private googleAuthService: IGoogleAuthService,
    private tokenService: ITokenService,
  ) {}

  async execute(data: IGoogleAuthRequestDTO): Promise<IGoogleAuthResponseDTO> {
    try {
      if (!data.code) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.GOOGLE_AUTH_MISSING_AUTHORIZATION_CODE.code,
            message: ERRORMESSAGES.GOOGLE_AUTH_MISSING_AUTHORIZATION_CODE.message,
          },
        };
      }

      const payload = await this.googleAuthService.verifyCode(data.code);
      if (!payload || !payload.email) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.USER_INVALID_GOOGLE_TOKEN.code,
            message: ERRORMESSAGES.USER_INVALID_GOOGLE_TOKEN.message,
          },
        };
      }

      console.log('The PAYLOAD DETAILS:', payload);

      let user = await this.userRepository.findByEmail(payload.email);
      if (!user) {
        user = User.create({
          name: payload.name || 'Google User',
          email: payload.email,
          password: '',
          role: 'user',
        });
        await this.userRepository.create(user);
        await this.userRepository.verifyUser(payload.email);
      }

      const {token :accessToken} = await this.tokenService.generateAccessToken({ email: user.email.address, id: user.id });
      const refreshToken = await this.tokenService.generateRefreshToken({ email: user.email.address, id: user.id });
      const userAuth: UserAuthResponseDTO = {
        id: user.id || '',
        email: user.email.address,
        name: user.name,
        role: user.role as 'user' | 'admin' | 'trainer',
        profilePic: user.profilePic || null,
        isVerified: user.isVerified || false,
      };

      await this.userRepository.updateRefreshToken(payload.email, refreshToken);

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.USER_LOGGED_IN,
        data: { user: userAuth, accessToken, refreshToken },
      };
    } catch (error) {
      console.log('Error from GoogleAuthUseCase:', error);
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: ERRORMESSAGES.GOOGLE_AUTH_GOOGLE_AUTH_FAILED.code,
          message: ERRORMESSAGES.GOOGLE_AUTH_GOOGLE_AUTH_FAILED.message,
        },
      };
    }
  }
}