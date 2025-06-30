// src/domain/dtos/IMembershipPlansResponseDTO.ts
import { MembershipPlan } from "../../entities/common/MembershipPlan";

export interface IMembershipPlansResponseDTO {
  plans: MembershipPlan[];
  total: number;
}