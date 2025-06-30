import { ITrainersRepository } from '../repositories/trainers.repository';
import { Trainer } from '../../domain/entities/Trainer.entity';
import { ILoginRequestDTO } from '../../domain/dtos/loginRequest.dto';
import { TrainerErrorType } from '../../domain/enums/trainerErrorType.enum';
import { IPasswordHasher } from '../providers/passwordHasher.service';
import { ITokenService } from '../providers/token.service';

interface LoginTrainerResponseDTO {
  success: boolean;
  data?: { trainer: Trainer; accessToken: string; refreshToken: string };
  error?: string;
}

export class LoginTrainerUseCase {
  constructor(
    private trainerRepository: ITrainersRepository,
    private passwordHasher: IPasswordHasher,
    private tokenService: ITokenService,
  ) {}

  async execute(data: ILoginRequestDTO): Promise<LoginTrainerResponseDTO> {
    try {
      const trainer = await this.trainerRepository.findByEmail(data.email);
      if (!trainer) {
        return { success: false, error: TrainerErrorType.TrainerNotFound };
      }

      if (!trainer.isVerified) {
        return { success: false, error: TrainerErrorType.NotVerified };
      }

      if (!trainer.verifiedByAdmin) {
        return { success: false, error: TrainerErrorType.NotApproved };
      }

      const isPasswordValid = await this.passwordHasher.comparePasswords(data.password, trainer.password);
      if (!isPasswordValid) {
        return { success: false, error: TrainerErrorType.InvalidCredentials };
      }

      const accessToken = await this.tokenService.generateAccessToken({ email: trainer.email.address, id: trainer.id });
      const refreshToken = await this.tokenService.generateRefreshToken({ email: trainer.email.address, id: trainer.id });

      await this.trainerRepository.updateRefreshToken(data.email, refreshToken);

      return { success: true, data: { trainer, accessToken, refreshToken } };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}