export interface IMembershipPlansResponseDTO {
  memberships: {
    _id: string;
    userId: string;
    planId: string;
    status: string;
    startDate: string;
    endDate: string;
    paymentId: string;
    price: number;
    currency: string;
    paymentStatus: string;
    paymentDate: string;
    createdAt: string;
    updatedAt: string;
  }[];
  plans: {
    _id: string;
    name: string;
    type: string;
    description: string;
    price: number;
    duration: number;
    features: string[];
    createdAt: string;
    updatedAt: string;
  }[];
  totalPages: number;
  totalPlans: number;
}