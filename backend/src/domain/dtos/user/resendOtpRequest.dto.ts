import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { z } from 'zod';

export interface IResendOtpRequestDTO {
  email: string;
}

export const ResendOtpRequest = z.object({
  email: z
    .string()
    .email({ message: ERRORMESSAGES.AUTH_INVALID_EMAIL.message }),
});

export class ResendOtpRequestDTO implements IResendOtpRequestDTO {
  public email: string;

  constructor(data: unknown) {
    const parsed = ResendOtpRequest.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((err) => err.message).join(', ');
      throw new Error(errors);
    }
    this.email = parsed.data.email;
  }

  toEntity(): IResendOtpRequestDTO {
    return {
      email: this.email,
    };
  }
}