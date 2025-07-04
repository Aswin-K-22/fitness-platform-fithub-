import { z } from 'zod';

export const GetAdminGymsRequestSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(5),
  search: z.string().optional(),
});

export type GetAdminGymsRequestDTO = z.infer<typeof GetAdminGymsRequestSchema>;