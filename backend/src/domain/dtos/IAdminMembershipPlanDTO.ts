// src/domain/dtos/IMembershipPlanDTO.ts
import { z } from 'zod';

export const MembershipPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['Basic', 'Premium', 'Diamond']),
  description: z.string().nullable(),
  price: z.number().min(0),
  duration: z.number().int().min(1),
  features: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type MembershipPlanDTO = z.infer<typeof MembershipPlanSchema>;