// src/domain/dtos/IAddMembershipPlanRequestDTO.ts
import { z } from 'zod';

export const AddMembershipPlanRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['Basic', 'Premium', 'Diamond'], {
    errorMap: () => ({ message: 'Plan type must be Basic, Premium, or Diamond' }),
  }),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  price: z.number().min(0.01, 'Price must be at least ₹0.01').max(100000),
  duration: z.enum(['1', '3', '6', '12'], {
    errorMap: () => ({ message: 'Duration must be 1, 3, 6, or 12 months' }),
  }).transform(val => parseInt(val)),
  features: z.array(z.enum(['24/7-access', 'personal-trainer', 'group-classes', 'spa-access'])).min(1, 'At least one feature is required'),
});

export type IAddMembershipPlanRequestDTO = z.infer<typeof AddMembershipPlanRequestSchema>;