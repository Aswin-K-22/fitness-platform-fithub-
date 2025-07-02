import { ITrainersRepository } from '../repositories/trainers.repository';
import { IPasswordHasher } from '../providers/passwordHasher.service';
import { IEmailService } from '../providers/email.service';
import { Trainer } from '../../domain/entities/Trainer.entity';
import { ICreateTrainerRequestDTO, CreateTrainerRequestDTO } from '../../domain/dtos/createTrainerRequest.dto';
import { TrainerErrorType } from '../../domain/enums/trainerErrorType.enum';
import { generateOtp } from '../../infra/utils/otp';

interface CreateTrainerResult {
  success: boolean;
  error?: string;
  data?: { trainer: Trainer };
}

export class CreateTrainerUseCase {
  constructor(
    private trainersRepository: ITrainersRepository,
    private passwordHasher: IPasswordHasher,
    private emailService: IEmailService
  ) {}

  async execute(data: ICreateTrainerRequestDTO): Promise<CreateTrainerResult> {
    try {
      const dto = new CreateTrainerRequestDTO(data);

      const existingTrainer = await this.trainersRepository.findByEmail(dto.email);
      if (existingTrainer) {
        return { success: false, error: TrainerErrorType.TrainerAlreadyExists };
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
      console.log(`Trainer Signup  OTP is ${otp}. It expires in 30 seconds.`)
      return { success: true, data: { trainer: savedTrainer } };
    } catch (error: any) {
      return { success: false, error: error.message || 'Internal server error' };
    }
  }
}