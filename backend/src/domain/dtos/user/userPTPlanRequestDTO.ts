import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { PTPlanCategory } from '@/domain/enums/PTPlanCategory';
import { z } from 'zod';

export interface IUserPTPlansRequestDTO {
  page: number;
  limit: number;
  category?: PTPlanCategory;
  minPrice?: number;
  maxPrice?: number;
}

export const PTPlansRequest = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, { message: ERRORMESSAGES.USER_INVALID_PAGE_NO.message }),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, { message: ERRORMESSAGES.USER_INVALID_PAGE_LIMIT_NO.message }),
  category: z
    .enum(['all', ...Object.values(PTPlanCategory)])
    .optional()
    .transform((val) => (val === 'all' ? undefined : val as PTPlanCategory)),
  minPrice: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => val >= 0, { message: ERRORMESSAGES.USER_INVALID_MIN_PRICE.message })
    .optional(),
  maxPrice: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => val > 0, { message: ERRORMESSAGES.USER_INVALID_MAX_PRICE.message })
    .optional(),
}).refine(
  (data) => data.minPrice === undefined || data.maxPrice === undefined || data.minPrice <= data.maxPrice,
  {
    message: 'minPrice must be less than or equal to maxPrice',
    path: ['minPrice', 'maxPrice'],
  }
);

export class  UserPTPlansRequestDTO implements IUserPTPlansRequestDTO {
  public page: number;
  public limit: number;
  public category?: PTPlanCategory;
  public minPrice?: number;
  public maxPrice?: number;

  constructor(data: unknown) {
    const parsed = PTPlansRequest.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((err) => err.message).join(', ');
      throw new Error(errors);
    }
    this.page = parsed.data.page;
    this.limit = parsed.data.limit;
    this.category = parsed.data.category;
    this.minPrice = parsed.data.minPrice;
    this.maxPrice = parsed.data.maxPrice;
  }

  toEntity(): IUserPTPlansRequestDTO {
    return {
      page: this.page,
      limit: this.limit,
      category: this.category,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
    };
  }
}