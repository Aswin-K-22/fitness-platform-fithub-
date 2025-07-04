// src/domain/dtos/getAdminMembershipPlansRequest.dto.ts
import { z } from 'zod';

export const GetAdminMembershipPlansRequestSchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').default(10),
});

export type IGetAdminMembershipPlansRequestDTO = z.infer<typeof GetAdminMembershipPlansRequestSchema>;