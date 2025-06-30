// src/domain/dtos/admin/IAddMembershipPlanRequestDTO.ts
export interface IAddMembershipPlanRequestDTO {
  name: "Premium" | "Basic" | "Diamond";
  description: string;
  price: number; // Changed to number for consistency
  duration: number; // Changed to number (months)
  features: string[];
}

