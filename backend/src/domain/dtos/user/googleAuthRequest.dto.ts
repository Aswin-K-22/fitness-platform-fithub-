import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { z } from 'zod';

export interface IGoogleAuthRequestDTO {
  token: string;
}

export const GoogleAuthRequest = z.object({
  token: z
    .string()
    .min(1, { message: ERRORMESSAGES.USER_INVALID_GOOGLE_TOKEN.message }),
});

export class GoogleAuthRequestDTO implements IGoogleAuthRequestDTO {
  public token: string;

  constructor(data: unknown) {
    const parsed = GoogleAuthRequest.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((err) => err.message).join(', ');
      throw new Error(errors);
    }
    this.token = parsed.data.token;
  }

  toEntity(): IGoogleAuthRequestDTO {
    return {
      token: this.token,
    };
  }
}