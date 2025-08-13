import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { z } from 'zod';

export interface ILogoutRequestDTO {
  email: string;
}

export const LogoutRequest = z.object({
  email: z
    .string()
    .email({ message: ERRORMESSAGES.USER_INVALID_EMAIL.message }),
});

export class LogoutRequestDTO implements ILogoutRequestDTO {
  public email: string;

  constructor(data: unknown) {
    const parsed = LogoutRequest.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((err) => err.message).join(', ');
      throw new Error(errors);
    }
    this.email = parsed.data.email;
  }

  toEntity(): ILogoutRequestDTO {
    return {
      email: this.email,
    };
  }
}