// purchase info (same as before)
export interface IUserPurchaseDTO {
  id: string | null;
  status: string;
  startDate: string;  // ISO date
  endDate: string;    // ISO date
  paymentId?: string | null;
  price?: number | null;
  currency: string;
  paymentStatus?: string | null;
  paymentDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

// plan + purchase
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

// trainer + all plans that user purchased
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

// final response wrapper
export interface IGetUserPTPlansResponseDTO {
  success: boolean;
  status: number;
  data?: IUserTrainerWithPlansDTO[];
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}
