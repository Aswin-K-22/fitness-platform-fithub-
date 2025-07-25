// src/domain/dtos/adminPTPlansRequestDTO.ts
import { z } from 'zod';
import { ERRORMESSAGES } from '../constants/errorMessages.constant';

export interface IAdminPTPlansRequestDTO {
  page: number;
  limit: number;
  verifiedByAdmin?: boolean;
}

export const AdminPTPlansRequest = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1, { message: ERRORMESSAGES.PTPLAN_INVALID_PAGE_NO.message }),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1 && val <= 100, { message: ERRORMESSAGES.PTPLAN_INVALID_PAGE_LIMIT_NO.message }),
  verifiedByAdmin: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      if (typeof val === 'boolean') return val;
      return val === 'true';
    }),
});

export class AdminPTPlansRequestDTO implements IAdminPTPlansRequestDTO {
  public page: number;
  public limit: number;
  public verifiedByAdmin?: boolean;

  constructor(data: unknown) {
    const parsed = AdminPTPlansRequest.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((err) => err.message).join(', ');
      throw new Error(errors);
    }
    this.page = parsed.data.page;
    this.limit = parsed.data.limit;
    this.verifiedByAdmin = parsed.data.verifiedByAdmin;
  }

  toEntity(): IAdminPTPlansRequestDTO {
    return {
      page: this.page,
      limit: this.limit,
      verifiedByAdmin: this.verifiedByAdmin,
    };
  }
}