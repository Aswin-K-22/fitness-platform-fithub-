export interface MembershipPlanDTO {
  id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IGetMembershipPlansResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  data?: {
    plans: MembershipPlanDTO[];
    page: number;
    totalPages: number;
    totalPlans: number;
  };
  error?: { code: string; message: string };
}