// Purchase info
export interface IUserPurchaseDTO {
  id: string | null;
  status: string;
  startDate: string;
  endDate: string;
  paymentId?: string | null;
  price?: number | null;
  currency: string;
  paymentStatus?: string | null;
  paymentDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Plan + purchase
export interface IUserPlanWithPurchaseDTO {
  plan: {
    id: string | null;
    title: string;
    category: string;
    mode: string;
    description: string;
    goal: string;
    features: string[];
    duration: number;
    image: string | null;
    trainerPrice: number;
    totalPrice: number | null;
    verifiedByAdmin: boolean;
  };
  purchase: IUserPurchaseDTO;
}

// Trainer + their purchased plans
export interface IUserTrainerWithPlansDTO {
  trainer: {
    id: string | null;
    name: string;
    profilePic: string | null;
    specialties: string[];
    experienceLevel?: string | null;
    bio?: string | null;
  };
  plans: IUserPlanWithPurchaseDTO[];
}

// State type for your React component
