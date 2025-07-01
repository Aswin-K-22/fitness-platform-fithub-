import { IUsersRepository } from '../repositories/users.repository';
import { User } from '../../domain/entities/User.entity';
import { IGoogleAuthRequestDTO } from '../../domain/dtos/googleAuthRequest.dto';
import { GoogleAuthErrorType } from '../../domain/enums/googleAuthErrorType.enum';
import { ITokenService } from '../providers/token.service';
import { IGoogleAuthService } from '../providers/googleAuth.service';
import { UserAuthResponseDTO } from '@/domain/dtos/userAuthResponse.dto';

interface GoogleAuthResponseDTO {
  success: boolean;
  data?: { user: UserAuthResponseDTO ; accessToken: string; refreshToken: string };
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
      console.log('the PAYLOAD DETAILS',payload)
      let user = await this.userRepository.findByEmail(payload.email);
      if (!user) {
        user = User.create({
          name: payload.name || 'Google User',
          email: payload.email,
          password: "",
          role: 'user',
        });
        await this.userRepository.create(user);
        await this.userRepository.verifyUser(payload.email);
      }

      const accessToken = await this.tokenService.generateAccessToken({ email: user.email.address, id: user.id });
      const refreshToken = await this.tokenService.generateRefreshToken({ email: user.email.address, id: user.id });
      const userAuth: UserAuthResponseDTO = {
              id: user.id || '', // Ensure id is always a string
              email: user.email.address,
              name: user.name,
              role: user.role as 'user' | 'admin' | 'trainer',
              profilePic: user.profilePic,
              isVerified: user.isVerified,
            };
      await this.userRepository.updateRefreshToken(payload.email, refreshToken);

      return { success: true, data: { user :userAuth, accessToken, refreshToken } };
    } catch (error) {
      console.log('Error from googleAuth useCase file =',error)
      return { success: false, error: GoogleAuthErrorType.GoogleAuthFailed };
    }
  }
}