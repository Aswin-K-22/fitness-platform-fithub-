// src/types/dtos/MembershipPlanDTO.ts
export interface MembershipPlanDTO {
  id: string;
  name: string;
  type: 'Basic' | 'Premium' | 'Diamond';
  description: string | null;
  price: number;
  duration: number;
  features: string[];
  createdAt: string;
  updatedAt: string;
}