import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { z } from 'zod';

export interface IResetPasswordRequestDTO {
  email: string;
  otp: string;
  newPassword: string;
}

export const ResetPasswordRequest = z.object({
  email: z
    .string()
    .email({ message: ERRORMESSAGES.USER_INVALID_EMAIL.message }),
  otp: z
    .string()
    .min(4, { message: ERRORMESSAGES.USER_INVALID_OTP.message })
    .max(6, { message: ERRORMESSAGES.USER_INVALID_OTP.message }),
  newPassword: z
    .string()
    .min(6, { message: ERRORMESSAGES.USER_INVALID_PASSWORD.message })

});

export class ResetPasswordRequestDTO implements IResetPasswordRequestDTO {
  public email: string;
  public otp: string;
  public newPassword: string;

  constructor(data: unknown) {
    const parsed = ResetPasswordRequest.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((err) => err.message).join(', ');
      throw new Error(errors);
    }
    this.email = parsed.data.email;
    this.otp = parsed.data.otp;
    this.newPassword = parsed.data.newPassword;
  }

  toEntity(): IResetPasswordRequestDTO {
    return {
      email: this.email,
      otp: this.otp,
      newPassword: this.newPassword,
    };
  }
}