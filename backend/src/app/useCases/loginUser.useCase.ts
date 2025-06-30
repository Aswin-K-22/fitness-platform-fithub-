import { IUsersRepository } from '../repositories/users.repository';
import { User } from '../../domain/entities/User.entity';
import { ILoginRequestDTO } from '../../domain/dtos/loginRequest.dto';
import { UserErrorType } from '../../domain/enums/userErrorType.enum';
import { IPasswordHasher } from '../providers/passwordHasher.service';
import { ITokenService } from '../providers/token.service';
import { LoginResponseDTO } from '@/domain/dtos/loginResponse.dto';
import { UserAuthResponseDTO } from '@/domain/dtos/userAuthResponse.dto';

// interface LoginResponseDTO {
//   success: boolean;
//   data?: { user: User; accessToken: string; refreshToken: string };
//   error?: string;
// }

export class LoginUserUseCase {
  constructor(
    private userRepository: IUsersRepository,
    private passwordHasher: IPasswordHasher,
    private tokenService: ITokenService,
  ) {}

  async execute(data: ILoginRequestDTO): Promise<LoginResponseDTO> {
    try {
      const user = await this.userRepository.findByEmail(data.email);
      if (!user) {
        return { success: false, error: UserErrorType.UserNotFound };
      }

      const isPasswordValid = await this.passwordHasher.comparePasswords(data.password, user.password);
      if (!isPasswordValid) {
        return { success: false, error: UserErrorType.InvalidCredentials };
      }

      const accessToken = await this.tokenService.generateAccessToken({ email: user.email.address, id: user.id });
      const refreshToken = await this.tokenService.generateRefreshToken({ email: user.email.address, id: user.id });

      await this.userRepository.updateRefreshToken(data.email, refreshToken);
      const userAuth: UserAuthResponseDTO = {
        id: user.id || '', // Ensure id is always a string
        email: user.email.address,
        name: user.name,
        role: user.role as 'user' | 'admin' | 'trainer',
        profilePic: user.profilePic,
        isVerified: user.isVerified,
      };
      

    return { success: true, data: { user: userAuth, accessToken, refreshToken } };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}