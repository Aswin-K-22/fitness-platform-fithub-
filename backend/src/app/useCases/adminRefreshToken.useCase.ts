import { IUsersRepository } from '@/app/repositories/users.repository';
import { ITokenService } from '@/app/providers/token.service';
import { IAdminRefreshTokenRequestDTO } from '@/domain/dtos/adminRefreshTokenRequest.dto';
import { IAdminLoginResponseDTO } from '@/domain/dtos/adminLoginResponse.dto';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { MESSAGES } from '@/domain/constants/messages.constant';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { IAdminRefreshTokenUseCase } from './interfaces/IAdminRefreshTokenUseCase';



export class AdminRefreshTokenUseCase implements IAdminRefreshTokenUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private tokenService: ITokenService,
  ) {}

  async execute(data: IAdminRefreshTokenRequestDTO): Promise<IAdminLoginResponseDTO> {
    try {
      const decoded = await this.tokenService.verifyRefreshToken(data.refreshToken);
      const admin = await this.usersRepository.findById(decoded.id);
      if (!admin) {
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          error: {
            code: ERRORMESSAGES.AUTH_USER_NOT_FOUND.code,
            message: ERRORMESSAGES.AUTH_USER_NOT_FOUND.message,
          },
        };
      }

      if (admin.role !== 'admin') {
        return {
          success: false,
          status: HttpStatus.FORBIDDEN,
          error: {
            code: ERRORMESSAGES.AUTH_INVALID_ROLE.code,
            message: ERRORMESSAGES.AUTH_INVALID_ROLE.message,
          },
        };
      }

      if (admin.refreshToken !== data.refreshToken) {
        return {
          success: false,
          status: HttpStatus.UNAUTHORIZED,
          error: {
            code: ERRORMESSAGES.AUTH_INVALID_REFRESH_TOKEN.code,
            message: ERRORMESSAGES.AUTH_INVALID_REFRESH_TOKEN.message,
          },
        };
      }

      const { token: newAccessToken} = await this.tokenService.generateAccessToken({ email: admin.email.address, id: admin.id! });
      const newRefreshToken = await this.tokenService.generateRefreshToken({ email: admin.email.address, id: admin.id! });
      await this.usersRepository.updateRefreshToken(admin.email.address, newRefreshToken);

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.SUCCESS,
        data: {
          admin: {
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
      return {
        success: false,
        status: HttpStatus.UNAUTHORIZED,
        error: {
          code: ERRORMESSAGES.AUTH_INVALID_REFRESH_TOKEN.code,
          message: ERRORMESSAGES.AUTH_INVALID_REFRESH_TOKEN.message,
        },
      };
    }
  }
}