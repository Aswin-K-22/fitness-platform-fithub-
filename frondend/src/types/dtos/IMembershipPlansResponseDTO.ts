// src/domain/dtos/IMembershipPlansResponseDTO.ts

import type { MembershipPlan } from "../membership.types";

export interface IMembershipPlansResponseDTO {
  success: boolean;
  plans: MembershipPlan[];
  page: number;
  totalPages: number;
  totalPlans: number;
}