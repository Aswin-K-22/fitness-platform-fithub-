import { ITrainersRepository } from '../repositories/trainers.repository';
import { IPasswordHasher } from '../providers/passwordHasher.service';
import { IEmailService } from '../providers/email.service';
import { Trainer } from '../../domain/entities/Trainer.entity';
import { ICreateTrainerRequestDTO, CreateTrainerRequestDTO } from '../../domain/dtos/createTrainerRequest.dto';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import { generateOtp } from '../../infra/utils/otp';
import { ICreateTrainerResponseDTO } from '@/domain/dtos/createTrainerResponse.dto';
import { ICreateTrainerUseCase } from './interfaces/ICreateTrainerUseCase';

export class CreateTrainerUseCase implements ICreateTrainerUseCase {
  constructor(
    private trainersRepository: ITrainersRepository,
    private passwordHasher: IPasswordHasher,
    private emailService: IEmailService
  ) {}

  async execute(data: ICreateTrainerRequestDTO): Promise<ICreateTrainerResponseDTO> {
    try {
      const dto = new CreateTrainerRequestDTO(data);

      const existingTrainer = await this.trainersRepository.findByEmail(dto.email);
      if (existingTrainer) {
        return {
          success: false,
          status: HttpStatus.CONFLICT,
         message: ERRORMESSAGES.TRAINER_ALREADY_EXISTS.message,
          error: {
            code: ERRORMESSAGES.TRAINER_ALREADY_EXISTS.code,
            message: ERRORMESSAGES.TRAINER_ALREADY_EXISTS.message,
          },
        };
      }

      const hashedPassword = await this.passwordHasher.hashPassword(dto.password);
      const trainer = Trainer.create({
        ...dto,
        password: hashedPassword,
      });

      const savedTrainer = await this.trainersRepository.signupTrainer(trainer);

      const otp = generateOtp();
      await this.trainersRepository.updateOtp(dto.email, otp);

      await this.emailService.sendMail({
        from: process.env.EMAIL_USER || 'no-reply@fithub.com',
        to: dto.email,
        subject: 'FitHub Trainer Signup - OTP Verification',
        text: `Your OTP is ${otp}. It expires in 30 seconds.`,
      });
      console.log(`Trainer Signup OTP is ${otp}. It expires in 30 seconds.`);

      return {
        success: true,
        status: HttpStatus.CREATED,
        message: MESSAGES.CREATED,
        data: { trainer: savedTrainer },
      };
    } catch (error) {
      return {
        success: false,
        message: ERRORMESSAGES.GENERIC_ERROR.message,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: ERRORMESSAGES.GENERIC_ERROR.code,
          message: ERRORMESSAGES.GENERIC_ERROR.message,
        },
      };
    }
  }
}