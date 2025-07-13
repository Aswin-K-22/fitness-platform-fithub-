import { MembershipPlanDTO } from './IAdminMembershipPlanDTO';

export interface IGetAdminMembershipPlansResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  data?: {
    plans: MembershipPlanDTO[];
    total: number;
    pages: number;
  };
  error?: { code: string; message: string };
}