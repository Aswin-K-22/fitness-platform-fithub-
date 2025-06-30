import { IUsersRepository } from '../repositories/users.repository';
import { User } from '../../domain/entities/User.entity';
import { AuthErrorType } from '../../domain/enums/authErrorType.enum';
import { UserAuthResponseDTO } from '@/domain/dtos/userAuthResponse.dto';
import { UserErrorType } from '@/domain/enums/userErrorType.enum';
import { GetUserResponseDTO } from '@/domain/dtos/getUserResponse.dto';

// interface GetUserResponseDTO {
//   success: boolean;
//   data?: { user: User };
//   error?: string;
// }

export class GetUserUseCase {
  constructor(private userRepository: IUsersRepository) {}

  async execute(email: string): Promise<GetUserResponseDTO> {
    try {
      if (!email) {
        return { success: false, error: AuthErrorType.UserNotAuthenticated };
      }

      const user = await this.userRepository.findByEmail(email);
      if (!user) {
              return { success: false, error: UserErrorType.UserNotFound };
            }
            const userAuth: UserAuthResponseDTO = {
              id: user.id || '', // Ensure id is always a string
              email: user.email.address,
              name: user.name,
              role: user.role as 'user' | 'admin' | 'trainer',
              profilePic: user.profilePic,
              isVerified: user.isVerified,
            };
      if (!user) {
        return { success: false, error: AuthErrorType.UserNotFound };
      }

      return { success: true, data: { user : userAuth ,} };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}