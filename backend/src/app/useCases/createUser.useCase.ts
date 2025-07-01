import { IUsersRepository } from '../repositories/users.repository';
import { User } from '../../domain/entities/User.entity';
import { ICreateUserRequestDTO } from '../../domain/dtos/createUserRequest.dto';
import { UserErrorType } from '../../domain/enums/userErrorType.enum';
import { IPasswordHasher } from '../providers/passwordHasher.service';
import { IEmailService } from '../providers/email.service';

interface CreateUserResponseDTO {
  success: boolean;
  data?: { user: User };
  error?: string;
}

export class CreateUserUseCase {
  constructor(
    private userRepository: IUsersRepository,
    private passwordHasher: IPasswordHasher,
    private emailService: IEmailService,
  ) {}

  async execute(data: ICreateUserRequestDTO): Promise<CreateUserResponseDTO> {
    try {
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) {
        return { success: false, error: UserErrorType.UserAlreadyExists };
      }

      const hashedPassword = await this.passwordHasher.hashPassword(data.password);
      const user = User.create({ ...data, password: hashedPassword });
      

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const createdUser = await this.userRepository.createWithOtp(user, otp);

      await this.emailService.sendMail({
        from: process.env.EMAIL_USER || 'no-reply@fithub.com',
        to: data.email,
        subject: 'FitHub OTP Verification',
        text: `Your OTP is ${otp}. It expires in 30 seconds.`,
      });
        console.log(` OTP is ${otp}. It expires in 30 seconds.`);
      return { success: true, data: { user: createdUser } };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}