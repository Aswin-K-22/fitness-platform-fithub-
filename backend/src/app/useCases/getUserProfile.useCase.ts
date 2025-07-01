import { IUsersRepository } from '../repositories/users.repository';
import { AuthErrorType } from '../../domain/enums/authErrorType.enum';
import { UserErrorType } from '@/domain/enums/userErrorType.enum';
import { UserProfileDataDTO } from '@/domain/dtos/getUserProfileResoponse.dto';
import { GetUserProfileResponseDTO } from '@/domain/dtos/getUserProfile.dto';



export class GetUserProfileUseCase {
  constructor(private userRepository: IUsersRepository) {}

  async execute(email: string): Promise<GetUserProfileResponseDTO> {
    try {
      if (!email) {
        return { success: false, error: AuthErrorType.UserNotAuthenticated };
      }

      const user = await this.userRepository.findByEmail(email);
      if (!user) {
              return { success: false, error: UserErrorType.UserNotFound };
            }
          const userAuth:  UserProfileDataDTO = {
        id: user.id,
        email: user.email.address,
        name: user.name,
        role: user.role as 'user' | 'admin' | 'trainer',
        createdAt: user.createdAt,
        profilePic: user.profilePic, 
        fitnessProfile: user.fitnessProfile || {},
        progress: user.progress || [],
        weeklySummary: user.weeklySummary || [],
      }
      if (!user) {
        return { success: false, error: AuthErrorType.UserNotFound };
      }

      return { success: true, data: { user : userAuth ,} };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}