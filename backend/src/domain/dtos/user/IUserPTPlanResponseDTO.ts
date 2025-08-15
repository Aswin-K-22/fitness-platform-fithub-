export interface IUserPTPlanResponseDTO {
  trainer: {
    id: string | null;
    name: string;
    profilePic: string | null;
    specialties: string[];
    experienceLevel: string | null;
    bio: string | null;
    // Any other Trainer fields you want to expose
  };
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
    // Any other PTPlan fields you want to expose
  };
  purchase: {
    id: string | null;
    status: string;
    startDate: string;  // ISO date string
    endDate: string;    // ISO date string
    paymentId: string | null | undefined;
    price: number | null | undefined;
    currency: string;
    paymentStatus: string | null | undefined;
    paymentDate: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

export interface IGetUserPTPlansResponseDTO {
  success: boolean;
  status: number;
  data?: IUserPTPlanResponseDTO[];
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}
