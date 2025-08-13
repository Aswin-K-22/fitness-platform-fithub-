import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { z } from 'zod';

export interface ILoginRequestDTO {
  email: string;
  password: string;
}

export const LoginRequest = z.object({
  email: z
    .string()
    .email({ message: ERRORMESSAGES.AUTH_INVALID_EMAIL.message }),
  password: z
    .string()
    .min(6, { message: ERRORMESSAGES.USER_INVALID_PASSWORD.message }),
});

export class LoginRequestDTO implements ILoginRequestDTO {
  public email: string;
  public password: string;

  constructor(data: unknown) {
    const parsed = LoginRequest.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((err) => err.message).join(', ');
      throw new Error(errors);
    }
    this.email = parsed.data.email;
    this.password = parsed.data.password;
  }

  toEntity(): ILoginRequestDTO {
    return {
      email: this.email,
      password: this.password,
    };
  }
}