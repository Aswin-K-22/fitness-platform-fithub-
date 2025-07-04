// src/domain/dtos/GetMembershipPlansRequestDTO.ts
import { z } from 'zod';

export const GetMembershipPlansRequestSchema = z.object({
  page: z
    .string()
    .optional()
    .transform(val => parseInt(val || '1'))
    .default('1')
    .refine(val => !isNaN(val) && val >= 1, { message: 'Page must be a positive number' }),
  limit: z
    .string()
    .optional()
    .transform(val => parseInt(val || '10'))
    .default('10')
    .refine(val => !isNaN(val) && val >= 1, { message: 'Limit must be a positive number' }),
});

export type GetMembershipPlansRequestDTO = z.infer<typeof GetMembershipPlansRequestSchema>;