import { IUsersRepository } from '../repositories/users.repository';
import { User } from '../../domain/entities/User.entity';
import { IRefreshTokenRequestDTO } from '../../domain/dtos/refreshTokenRequest.dto';
import { AuthErrorType } from '../../domain/enums/authErrorType.enum';
import { ITokenService } from '../providers/token.service';
import { log } from 'node:console';

interface RefreshTokenResponseDTO {
  success: boolean;
  data?: { user: User; accessToken: string; refreshToken: string };
  error?: string;
}

export class RefreshTokenUseCase {
  constructor(
    private userRepository: IUsersRepository,
    private tokenService: ITokenService,
  ) {}

  async execute(data: IRefreshTokenRequestDTO): Promise<RefreshTokenResponseDTO> {
    try {
      console.log('Verifying refresh token:', data.refreshToken[0]);
      if (!data.refreshToken) {
        return { success: false, error: AuthErrorType.MissingRefreshToken };
      }

      const decoded = await this.tokenService.verifyRefreshToken(data.refreshToken);
      if (!decoded.email || !decoded.id) {
        console.log("invalid refresh token-with mail =",decoded.email , 'ID=',decoded.id)
        return { success: false, error: AuthErrorType.InvalidRefreshTokenStructure };
      }
      console.log('ID ',decoded.id)
      const user = await this.userRepository.findById(decoded.id);
      if (!user || user.refreshToken !== data.refreshToken) {

        console.log("invalid refresh token-with id ",decoded.id,'also checking the userDB-refreshToken and cookieRefreshToken value is equle = ', user?.refreshToken ==  data.refreshToken)
        return { success: false, error: AuthErrorType.InvalidRefreshToken };
      }

      const accessToken = await this.tokenService.generateAccessToken({ email: user.email.address, id: user.id });
      const refreshToken = await this.tokenService.generateRefreshToken({ email: user.email.address, id: user.id });

      await this.userRepository.updateRefreshToken(user.email.address, refreshToken);

      return { success: true, data: { user, accessToken, refreshToken } };
    } catch (error) {
      console.log('Error from refresh token Use case file =',error)
      return { success: false, error: AuthErrorType.InvalidRefreshToken };
    }
  }
}