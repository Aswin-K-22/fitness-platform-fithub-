import { IUsersRepository } from '@/app/repositories/users.repository';
import { IAdminGetResponseDTO } from '@/domain/dtos/adminGetResponse.dto';
import { UserErrorType } from '@/domain/enums/userErrorType.enum';

interface IResponse {
  success: boolean;
  data?: IAdminGetResponseDTO;
  error?: string;
}

export class GetAdminUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(email: string): Promise<IResponse> {
    try {
      const user = await this.usersRepository.findByEmail(email);
      if (!user) {
        return { success: false, error: UserErrorType.UserNotFound };
      }

      if (user.role !== 'admin') {
        return { success: false, error: UserErrorType.InvalidRole };
      }

      return {
        success: true,
        data: {
          user: {
            id: user.id!,
            email: user.email.address,
            name: user.name,
            role: user.role,
            profilePic: user.profilePic,
          },
        },
      };
    } catch (error) {
      return { success: false, error: UserErrorType.UserNotFound };
    }
  }
}