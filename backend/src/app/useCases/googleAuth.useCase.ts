import { IUsersRepository } from '../repositories/users.repository';
import { User } from '../../domain/entities/User.entity';
import { IGoogleAuthRequestDTO } from '../../domain/dtos/googleAuthRequest.dto';
import { GoogleAuthErrorType } from '../../domain/enums/googleAuthErrorType.enum';
import { ITokenService } from '../providers/token.service';
import { IGoogleAuthService } from '../providers/googleAuth.service';

interface GoogleAuthResponseDTO {
  success: boolean;
  data?: { user: User; accessToken: string; refreshToken: string };
  error?: string;
}

export class GoogleAuthUseCase {
  constructor(
    private userRepository: IUsersRepository,
    private googleAuthService: IGoogleAuthService,
    private tokenService: ITokenService,
  ) {}

  async execute(data: IGoogleAuthRequestDTO): Promise<GoogleAuthResponseDTO> {
    try {
      const payload = await this.googleAuthService.verifyCode(data.code);
      if (!payload || !payload.email) {
        return { success: false, error: GoogleAuthErrorType.InvalidGoogleToken };
      }

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

      const accessToken = await this.tokenService.generateAccessToken({ email: user.email.address, id: user.id });
      const refreshToken = await this.tokenService.generateRefreshToken({ email: user.email.address, id: user.id });

      await this.userRepository.updateRefreshToken(payload.email, refreshToken);

      return { success: true, data: { user, accessToken, refreshToken } };
    } catch (error) {
      return { success: false, error: GoogleAuthErrorType.GoogleAuthFailed };
    }
  }
}