import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { z } from 'zod';

export interface IVerifyOtpRequestDTO {
  email: string;
  otp: string;
}

export const VerifyOtpRequest = z.object({
  email: z
    .string()
    .email({ message: ERRORMESSAGES.AUTH_INVALID_EMAIL.message }),
  otp: z
    .string()
    .min(4, { message: ERRORMESSAGES.USER_INVALID_OTP.message })
    .max(6, { message: ERRORMESSAGES.USER_INVALID_OTP.message }),
});

export class VerifyOtpRequestDTO implements IVerifyOtpRequestDTO {
  public email: string;
  public otp: string;

  constructor(data: unknown) {
    const parsed = VerifyOtpRequest.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((err) => err.message).join(', ');
      throw new Error(errors);
    }
    this.email = parsed.data.email;
    this.otp = parsed.data.otp;
  }

  toEntity(): IVerifyOtpRequestDTO {
    return {
      email: this.email,
      otp: this.otp,
    };
  }
}