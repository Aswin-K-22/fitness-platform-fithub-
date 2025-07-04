// src/types/dtos/IAddMembershipPlanRequestDTO.ts
export interface IAddMembershipPlanRequestDTO {
  name: string;
  type: 'Basic' | 'Premium' | 'Diamond';
  description: string;
  price: number;
  duration: string
  features: string[];
}