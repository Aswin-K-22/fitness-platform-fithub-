import { IUsersRepository } from '../repositories/users.repository';
import { IToggleUserVerificationRequestDTO } from '../../domain/dtos/toggleUserVerificationRequest.dto';
import { IToggleUserVerificationResponseDTO } from '../../domain/dtos/toggleUserVerificationResponse.dto';
import { UserErrorType } from '../../domain/enums/userErrorType.enum';

export class ToggleUserVerificationUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(
    data: IToggleUserVerificationRequestDTO,
  ): Promise<IToggleUserVerificationResponseDTO> {
    try {
      const user = await this.usersRepository.toggleUserVerification(data.userId);
      return { user };
    } catch (error) {
      throw new Error(UserErrorType.FailedToToggleVerification);
    }
  }
}