// src/domain/dtos/IAddMembershipPlanResponseDTO.ts
import { z } from 'zod';
import { MembershipPlanSchema } from './IAdminMembershipPlanDTO';

export const AddMembershipPlanResponseSchema = z.object({
  success: z.boolean(),
  status: z.number(),
  message: z.string().optional(),
  data: z.object({ plan: MembershipPlanSchema }).optional(),
  error: z.object({ code: z.string(), message: z.string() }).optional(),
});

export type IAddMembershipPlanResponseDTO = z.infer<typeof AddMembershipPlanResponseSchema>;