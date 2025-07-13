import { IUsersRepository } from '../repositories/users.repository';
import { IRefreshTokenRequestDTO } from '../../domain/dtos/refreshTokenRequest.dto';
import { ITokenService } from '../providers/token.service';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import { IRefreshTokenResponseDTO } from '@/domain/dtos/refreshTokenResponse.dto';
import { UserAuthResponseDTO } from '../../domain/dtos/userAuthResponse.dto';

export class RefreshTokenUseCase {
  constructor(
    private userRepository: IUsersRepository,
    private tokenService: ITokenService,
  ) {}

  async execute(data: IRefreshTokenRequestDTO): Promise<IRefreshTokenResponseDTO> {
    try {
      console.log('Verifying refresh token:', data.refreshToken);
      if (!data.refreshToken) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: ERRORMESSAGES.AUTH_MISSING_REFRESH_TOKEN.code,
            message: ERRORMESSAGES.AUTH_MISSING_REFRESH_TOKEN.message,
          },
        };
      }

      const decoded = await this.tokenService.verifyRefreshToken(data.refreshToken);
      if (!decoded.email || !decoded.id) {
        console.log('Invalid refresh token - email:', decoded.email, 'ID:', decoded.id);
        return {
          success: false,
          status: HttpStatus.UNAUTHORIZED,
          error: {
            code: ERRORMESSAGES.AUTH_INVALID_REFRESH_TOKEN_STRUCTURE.code,
            message: ERRORMESSAGES.AUTH_INVALID_REFRESH_TOKEN_STRUCTURE.message,
          },
        };
      }

      console.log('ID:', decoded.id);
      const user = await this.userRepository.findById(decoded.id);
      if (!user || user.refreshToken !== data.refreshToken) {
        console.log(
          'Invalid refresh token - ID:',
          decoded.id,
          'userDB refreshToken equals cookie refreshToken:',
          user?.refreshToken === data.refreshToken,
        );
        return {
          success: false,
          status: HttpStatus.UNAUTHORIZED,
          error: {
            code: ERRORMESSAGES.AUTH_INVALID_REFRESH_TOKEN.code,
            message: ERRORMESSAGES.AUTH_INVALID_REFRESH_TOKEN.message,
          },
        };
      }

      const accessToken = await this.tokenService.generateAccessToken({ email: user.email.address, id: user.id });
      const refreshToken = await this.tokenService.generateRefreshToken({ email: user.email.address, id: user.id });
      await this.userRepository.updateRefreshToken(user.email.address, refreshToken);

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
      console.error('Error from RefreshTokenUseCase:', error);
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