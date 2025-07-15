import { ITrainersRepository } from '../repositories/trainers.repository';
import { IPasswordHasher } from '../providers/passwordHasher.service';
import { ITokenService } from '../providers/token.service';
import { ILoginRequestDTO, LoginRequestDTO } from '../../domain/dtos/loginRequest.dto';
import { ILoginTrainerResponseDTO } from '../../domain/dtos/trainerLoginResponse.dto';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import { ILoginTrainerUseCase } from './interfaces/ILoginTrainerUseCase';

export class LoginTrainerUseCase implements ILoginTrainerUseCase {
  constructor(
    private trainersRepository: ITrainersRepository,
    private passwordHasher: IPasswordHasher,
    private tokenService: ITokenService
  ) {}

  async execute(data: ILoginRequestDTO): Promise<ILoginTrainerResponseDTO> {
    try {
      const dto = new LoginRequestDTO(data);

      const trainer = await this.trainersRepository.findByEmail(dto.email);
      if (!trainer) {
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: ERRORMESSAGES.TRAINER_NOT_FOUND.message,
          error: {
            code: ERRORMESSAGES.TRAINER_NOT_FOUND.code,
            message: ERRORMESSAGES.TRAINER_NOT_FOUND.message,
          },
        };
      }

      const isPasswordValid = await this.passwordHasher.comparePasswords(dto.password, trainer.password);
      if (!isPasswordValid) {
        return {
          success: false,
          status: HttpStatus.UNAUTHORIZED,
          message: ERRORMESSAGES.TRAINER_INVALID_CREDENTIALS.message,
          error: {
            code: ERRORMESSAGES.TRAINER_INVALID_CREDENTIALS.code,
            message: ERRORMESSAGES.TRAINER_INVALID_CREDENTIALS.message,
          },
        };
      }

      if (!trainer.isVerified) {
        return {
          success: false,
          status: HttpStatus.FORBIDDEN,
          message: ERRORMESSAGES.TRAINER_EMAIL_NOT_VERIFIED.message,
          error: {
            code: ERRORMESSAGES.TRAINER_EMAIL_NOT_VERIFIED.code,
            message: ERRORMESSAGES.TRAINER_EMAIL_NOT_VERIFIED.message,
          },
        };
      }

      if (!trainer.verifiedByAdmin) {
        return {
          success: false,
          status: HttpStatus.FORBIDDEN,
          message: ERRORMESSAGES.TRAINER_NOT_APPROVED_BY_ADMIN.message,
          error: {
            code: ERRORMESSAGES.TRAINER_NOT_APPROVED_BY_ADMIN.code,
            message: ERRORMESSAGES.TRAINER_NOT_APPROVED_BY_ADMIN.message,
          },
        };
      }

      const responseTrainer = {
        id: trainer.id,
        email: trainer.email.address,
        name: trainer.name,
        role: 'trainer' as const,
        isVerified: trainer.isVerified,
        verifiedByAdmin: trainer.verifiedByAdmin,
        profilePic: trainer.profilePic || null,
      };

      const { token: accessToken } = await this.tokenService.generateAccessToken({ email: trainer.email.address, id: trainer.id });
      const refreshToken = await this.tokenService.generateRefreshToken({ email: trainer.email.address, id: trainer.id });

      await this.trainersRepository.updateRefreshToken(dto.email, refreshToken);

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.TRAINER_APPROVED,
        data: { trainer: responseTrainer, accessToken, refreshToken },
      };
    } catch (error) {
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ERRORMESSAGES.GENERIC_ERROR.message,
        error: {
          code: ERRORMESSAGES.GENERIC_ERROR.code,
          message: ERRORMESSAGES.GENERIC_ERROR.message,
        },
      };
    }
  }
}