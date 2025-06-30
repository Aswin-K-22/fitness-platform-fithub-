import { ITrainersRepository } from '../repositories/trainers.repository';
import { Trainer } from '@/domain/entities/Trainer.entity';
import { ICreateTrainerRequestDTO } from '../../domain/dtos/createTrainerRequest.dto';
import { TrainerErrorType } from '../../domain/enums/trainerErrorType.enum';
import { IPasswordHasher } from '../providers/passwordHasher.service';
import { IEmailService } from '../providers/email.service';

interface CreateTrainerResponseDTO {
  success: boolean;
  data?: { trainer: Trainer };
  error?: string;
}

export class CreateTrainerUseCase {
  constructor(
    private trainerRepository: ITrainersRepository,
    private passwordHasher: IPasswordHasher,
    private emailService: IEmailService,
  ) {}

  async execute(data: ICreateTrainerRequestDTO): Promise<CreateTrainerResponseDTO> {
    try {
      const existingTrainer = await this.trainerRepository.findByEmail(data.email);
      if (existingTrainer) {
        return { success: false, error: TrainerErrorType.TrainerAlreadyExists };
      }

      const hashedPassword = await this.passwordHasher.hashPassword(data.password);
      const trainer = Trainer.create({ ...data, password: hashedPassword });

      await this.trainerRepository.signupTrainer(trainer);

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await this.trainerRepository.updateOtp(data.email, otp);

      await this.emailService.sendMail({
        from: process.env.EMAIL_USER || 'no-reply@fithub.com',
        to: data.email,
        subject: 'FitHub Trainer Signup - OTP Verification',
        text: `Your OTP is ${otp}. It expires in 30 seconds.`,
      });

      return { success: true, data: { trainer } };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}