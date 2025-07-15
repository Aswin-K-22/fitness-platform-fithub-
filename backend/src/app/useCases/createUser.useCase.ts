import { IUsersRepository } from '../repositories/users.repository';
import { User } from '../../domain/entities/User.entity';
import { ICreateUserRequestDTO } from '../../domain/dtos/createUserRequest.dto';
import { IPasswordHasher } from '../providers/passwordHasher.service';
import { IEmailService } from '../providers/email.service';
import { ERRORMESSAGES } from '../../domain/constants/errorMessages.constant';
import { MESSAGES } from '../../domain/constants/messages.constant';
import { HttpStatus } from '../../domain/enums/httpStatus.enum';
import { ICreateUserResponseDTO } from '../../domain/dtos/createUserResponse.dto';
import { ICreateUserUseCase } from './interfaces/ICreateUserUseCase';

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(
    private userRepository: IUsersRepository,
    private passwordHasher: IPasswordHasher,
    private emailService: IEmailService,
  ) {}

  async execute(data: ICreateUserRequestDTO): Promise<ICreateUserResponseDTO> {
    try {
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) {
        return {
          success: false,
          status: HttpStatus.CONFLICT,
          error: {
            code: ERRORMESSAGES.USER_ALREADY_EXISTS.code,
            message: ERRORMESSAGES.USER_ALREADY_EXISTS.message,
          },
        };
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
      console.log(`OTP is ${otp}. It expires in 30 seconds.`);

      return {
        success: true,
        status: HttpStatus.CREATED,
        message: MESSAGES.CREATED,
        data: { user: createdUser },
      };
    } catch (error) {
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: ERRORMESSAGES.GENERIC_ERROR.code,
          message: ERRORMESSAGES.GENERIC_ERROR.message,
        },
      };
    }
  }
}