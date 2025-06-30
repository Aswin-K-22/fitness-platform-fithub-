// src/domain/dtos/admin/IGetMembershipPlansResponseDTO.ts
import { MembershipPlan } from "../../entities/common/MembershipPlan";

export interface IGetMembershipPlansResponseDTO {
  plans: MembershipPlan[];
  total: number;
  pages: number;
}