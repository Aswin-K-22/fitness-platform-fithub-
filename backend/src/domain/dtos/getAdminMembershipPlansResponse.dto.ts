// src/domain/dtos/getAdminMembershipPlansResponse.dto.ts
import { z } from 'zod';
import { MembershipPlanSchema } from './IAdminMembershipPlanDTO';

export const GetAdminMembershipPlansResponseSchema = z.object({
  success: z.literal(true),
  plans: z.array(MembershipPlanSchema),
  total: z.number().int().min(0),
  pages: z.number().int().min(0),
});

export type IGetAdminMembershipPlansResponseDTO = z.infer<typeof GetAdminMembershipPlansResponseSchema>;