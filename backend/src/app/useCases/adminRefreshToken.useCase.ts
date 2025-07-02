import { IUsersRepository } from '@/app/repositories/users.repository';
import { ITokenService } from '@/app/providers/token.service';
import { IAdminRefreshTokenRequestDTO } from '@/domain/dtos/adminRefreshTokenRequest.dto';
import { IAdminLoginResponseDTO } from '@/domain/dtos/adminLoginResponse.dto';
import { UserErrorType } from '@/domain/enums/userErrorType.enum';
import { AuthErrorType } from '@/domain/enums/authErrorType.enum';

interface IResponse {
  success: boolean;
  data?: IAdminLoginResponseDTO;
  error?: string;
}

export class AdminRefreshTokenUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private tokenService: ITokenService,
  ) {}

  async execute(data: IAdminRefreshTokenRequestDTO): Promise<IResponse> {
    try {
      const decoded = await this.tokenService.verifyRefreshToken(data.refreshToken);
      const admin = await this.usersRepository.findById(decoded.id);
      if (!admin) {
        return { success: false, error: UserErrorType.UserNotFound };
      }

      if (admin.role !== 'admin') {
        return { success: false, error: AuthErrorType.InvalidRole };
      }

      if (admin.refreshToken !== data.refreshToken) {
        return { success: false, error: AuthErrorType.InvalidRefreshToken };
      }

      const newAccessToken = await this.tokenService.generateAccessToken({ email: admin.email.address, id: admin.id! });
      const newRefreshToken = await this.tokenService.generateRefreshToken({ email: admin.email.address, id: admin.id! });
      await this.usersRepository.updateRefreshToken(admin.email.address, newRefreshToken);

      return {
        success: true,
        data: {
          user: {
            id: admin.id!,
            email: admin.email.address,
            name: admin.name,
            role: admin.role,
          },
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      };
    } catch (error) {
      return { success: false, error: AuthErrorType.InvalidRefreshToken };
    }
  }
}