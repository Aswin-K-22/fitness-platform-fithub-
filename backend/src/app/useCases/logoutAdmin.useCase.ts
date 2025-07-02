import { IUsersRepository } from '@/app/repositories/users.repository';
import { IAdminLogoutRequestDTO } from '@/domain/dtos/logoutAdminRequest.dto';
import { UserErrorType } from '@/domain/enums/userErrorType.enum';

interface AdminLogoutResponse {
  success: boolean;
  error?: string;
}

export class LogoutAdminUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(data: IAdminLogoutRequestDTO): Promise<AdminLogoutResponse> {
    try {
      const user = await this.usersRepository.findByEmail(data.email);
      if (!user) {
        return { success: false, error: UserErrorType.UserNotFound };
      }

      if (user.role !== 'admin') {
        return { success: false, error: UserErrorType.InvalidRole };
      }

      await this.usersRepository.updateRefreshToken(data.email, null);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}