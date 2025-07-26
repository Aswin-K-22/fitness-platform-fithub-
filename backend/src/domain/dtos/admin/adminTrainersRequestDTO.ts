//src/domain/dtos/admin/adminTrainersRequestDTO.ts:
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { z } from 'zod';

export interface IAdminTrainersRequestDTO {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  specialization?: string;
}

export const AdminTrainersRequest = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1, { message: ERRORMESSAGES.TRAINER_INVALID_PAGE_NO.message }),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1 && val <= 100, { message: ERRORMESSAGES.TRAINER_INVALID_PAGE_LIMIT_NO.message }),
  search: z.string().optional().transform((val) => (val ? val.trim() : undefined)),
  status: z
    .enum(['Pending', 'Approved', ''])
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  specialization: z
    .enum(['Cardio', 'Pilates', 'Strength','Yoga', '',])
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
});

export class AdminTrainersRequestDTO implements IAdminTrainersRequestDTO {
  public page: number;
  public limit: number;
  public search?: string;
  public status?: string;
  public specialization?: string;

  constructor(data: unknown) {
    const parsed = AdminTrainersRequest.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((err) => err.message).join(', ');
      throw new Error(errors);
    }
    this.page = parsed.data.page;
    this.limit = parsed.data.limit;
    this.search = parsed.data.search;
    this.status = parsed.data.status;
    this.specialization = parsed.data.specialization;
  }

  toEntity(): IAdminTrainersRequestDTO {
    return {
      page: this.page,
      limit: this.limit,
      search: this.search,
      status: this.status,
      specialization: this.specialization,
    };
  }
}