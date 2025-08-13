import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { z } from 'zod';

export interface IForgotPasswordRequestDTO {
  email: string;
}

export const ForgotPasswordRequest = z.object({
  email: z
    .string()
    .email({ message: ERRORMESSAGES.AUTH_INVALID_EMAIL.message }),
});

export class ForgotPasswordRequestDTO implements IForgotPasswordRequestDTO {
  public email: string;

  constructor(data: unknown) {
    const parsed = ForgotPasswordRequest.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((err) => err.message).join(', ');
      throw new Error(errors);
    }
    this.email = parsed.data.email;
  }

  toEntity(): IForgotPasswordRequestDTO {
    return {
      email: this.email,
    };
  }
}