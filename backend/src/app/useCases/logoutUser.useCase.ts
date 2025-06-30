import { IUsersRepository } from '../repositories/users.repository';
import { ILogoutRequestDTO } from '../../domain/dtos/logoutRequest.dto';
import { UserErrorType } from '../../domain/enums/userErrorType.enum';

interface LogoutResponseDTO {
  success: boolean;
  error?: string;
}

export class LogoutUserUseCase {
  constructor(private userRepository: IUsersRepository) {}

  async execute(data: ILogoutRequestDTO): Promise<LogoutResponseDTO> {
    try {
      const user = await this.userRepository.findByEmail(data.email);
      if (!user) {
        return { success: false, error: UserErrorType.UserNotFound };
      }

      await this.userRepository.updateRefreshToken(data.email, null);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}