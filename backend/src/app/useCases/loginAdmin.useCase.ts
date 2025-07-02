import { IUsersRepository } from '@/app/repositories/users.repository';
import { IPasswordHasher } from '@/app/providers/passwordHasher.service';
import { ITokenService } from '@/app/providers/token.service';
import { IAdminLoginRequestDTO } from '@/domain/dtos/adminLoginRequest.dto';
import { IAdminLoginResponseDTO } from '@/domain/dtos/adminLoginResponse.dto';
import { UserErrorType } from '@/domain/enums/userErrorType.enum';
import { AuthErrorType } from '@/domain/enums/authErrorType.enum';
import { User } from '@/domain/entities/User.entity';

interface IResponse {
  success: boolean;
  data?: IAdminLoginResponseDTO;
  error?: string;
}

export class LoginAdminUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private passwordHasher: IPasswordHasher,
    private tokenService: ITokenService,
  ) {}

  async execute(data: IAdminLoginRequestDTO): Promise<IResponse> {
    try {
      const user = await this.usersRepository.findByEmail(data.email);
      if (!user) {
        return { success: false, error: UserErrorType.UserNotFound };
      }

      if (user.role !== 'admin') {
        return { success: false, error: AuthErrorType.InvalidRole };
      }

      if (!user.isVerified) {
        return { success: false, error: UserErrorType.UserNotVerified };
      }

      if (!user.password) {
        return { success: false, error: AuthErrorType.InvalidCredentials };
      }

      const isPasswordValid = await this.passwordHasher.comparePasswords(data.password, user.password);
      if (!isPasswordValid) {
        return { success: false, error: AuthErrorType.InvalidCredentials };
      }

      const accessToken = await this.tokenService.generateAccessToken({ email: user.email.address, id: user.id! });
      const refreshToken = await this.tokenService.generateRefreshToken({ email: user.email.address, id: user.id! });
      await this.usersRepository.updateRefreshToken(user.email.address, refreshToken);

      return {
        success: true,
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
      return { success: false, error: UserErrorType.InvalidCredentials };
    }
  }
}