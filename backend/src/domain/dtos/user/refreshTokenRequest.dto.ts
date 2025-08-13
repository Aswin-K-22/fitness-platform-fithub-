import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { z } from 'zod';

export interface IRefreshTokenRequestDTO {
  refreshToken: string;
}

export const RefreshTokenRequest = z.object({
  refreshToken: z
    .string()
    .min(1, { message: ERRORMESSAGES.AUTH_MISSING_REFRESH_TOKEN.message }),
});

export class RefreshTokenRequestDTO implements IRefreshTokenRequestDTO {
  public refreshToken: string;

  constructor(data: unknown) {
    const parsed = RefreshTokenRequest.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((err) => err.message).join(', ');
      throw new Error(errors);
    }
    this.refreshToken = parsed.data.refreshToken;
  }

  toEntity(): IRefreshTokenRequestDTO {
    return {
      refreshToken: this.refreshToken,
    };
  }
}