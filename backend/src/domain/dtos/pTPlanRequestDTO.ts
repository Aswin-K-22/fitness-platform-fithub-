import { z } from 'zod';
import { ERRORMESSAGES } from '../constants/errorMessages.constant';

export interface IPTPlansRequestDTO {
  page: number;
  limit: number;
}

export const PTPlansRequest = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1, { message: ERRORMESSAGES.PTPLAN_INVALID_PAGE_NO.message }),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1 && val <= 100, { message: ERRORMESSAGES.PTPLAN_INVALID_PAGE_LIMIT_NO.message }),
});

export class PTPlansRequestDTO implements IPTPlansRequestDTO {
  public page: number;
  public limit: number;

  constructor(data: unknown) {
    const parsed = PTPlansRequest.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((err) => err.message).join(', ');
      throw new Error(errors);
    }
    this.page = parsed.data.page;
    this.limit = parsed.data.limit;
  }

  toEntity(): IPTPlansRequestDTO {
    return {
      page: this.page,
      limit: this.limit,
    };
  }
}