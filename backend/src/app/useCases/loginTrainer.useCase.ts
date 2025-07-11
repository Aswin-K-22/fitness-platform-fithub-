import { ITrainersRepository } from '../repositories/trainers.repository';
import { IPasswordHasher } from '../providers/passwordHasher.service';
import { ITokenService } from '../providers/token.service';
import { ILoginRequestDTO, LoginRequestDTO } from '../../domain/dtos/loginRequest.dto';
import { ILoginResponseDTO } from '../../domain/dtos/trainerLoginResponse.dto';
import { AuthErrorType } from '../../domain/enums/authErrorType.enum';
import { TrainerErrorType } from '../../domain/enums/trainerErrorType.enum';

interface LoginTrainerResult {
  success: boolean;
  error?: string;
  data?: {
    trainer: ILoginResponseDTO['trainer'];
    accessToken: string;
    refreshToken: string;
  };
}

export class LoginTrainerUseCase {
  constructor(
    private trainersRepository: ITrainersRepository,
    private passwordHasher: IPasswordHasher,
    private tokenService: ITokenService
  ) {}

  async execute(data: ILoginRequestDTO): Promise<LoginTrainerResult> {
    try {
      const dto = new LoginRequestDTO(data);

      const trainer = await this.trainersRepository.findByEmail(dto.email);
      if (!trainer) {
        return { success: false, error: AuthErrorType.TrainerNotFound };
      }

      const isPasswordValid = await this.passwordHasher.comparePasswords(dto.password, trainer.password);
      if (!isPasswordValid) {
        return { success: false, error: AuthErrorType.InvalidCredentials };
      }

      if (!trainer.isVerified) {
        return { success: false, error: AuthErrorType.EmailNotVerified };
      }

      const responseTrainer: ILoginResponseDTO['trainer'] = {
        id: trainer.id,
        email: trainer.email.address,
        name: trainer.name,
        role: 'trainer',
        isVerified: trainer.isVerified,
        verifiedByAdmin: trainer.verifiedByAdmin,
        profilePic: trainer.profilePic || null,
      };

     

      const accessToken = await this.tokenService.generateAccessToken({ email: trainer.email.address, id: trainer.id });
      const refreshToken = await this.tokenService.generateRefreshToken({ email: trainer.email.address, id: trainer.id });

      await this.trainersRepository.updateRefreshToken(dto.email, refreshToken);

       if (!trainer.verifiedByAdmin) {
        return { success: true, data: { trainer: responseTrainer, accessToken, refreshToken} };
      }

      return { success: true, data: { trainer: responseTrainer, accessToken, refreshToken } };
    } catch (error: any) {
      return { success: false, error: error.message || 'Internal server error' };
    }
  }
}