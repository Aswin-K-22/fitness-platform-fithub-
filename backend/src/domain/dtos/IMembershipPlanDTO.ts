export interface MembershipPlanDTO {
  id: string;
  name: string; 
  description: string;
  price: number;
  duration: number;
  features: string[];
  createdAt: string | undefined;
  updatedAt: string | undefined;
}

export interface IGetMembershipPlansResponseDTO {
  success: boolean;
  plans: MembershipPlanDTO[];
  page: number;
  totalPages: number;
  totalPlans: number;
}