// src/domain/dtos/IAddMembershipPlanResponseDTO.ts
import { z } from 'zod';
import { MembershipPlanSchema } from './IAdminMembershipPlanDTO';

export const AddMembershipPlanResponseSchema = z.object({
  success: z.literal(true),
  plan: MembershipPlanSchema,
});

export type IAddMembershipPlanResponseDTO = z.infer<typeof AddMembershipPlanResponseSchema>;