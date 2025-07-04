// src/domain/dtos/admin/IGetMembershipPlansResponseDTO.ts

import type { MembershipPlan } from "../membership.types";

export interface IGetMembershipPlansResponseDTO {
  success: boolean;
  plans: MembershipPlan[];
  total: number;
  pages: number;
}