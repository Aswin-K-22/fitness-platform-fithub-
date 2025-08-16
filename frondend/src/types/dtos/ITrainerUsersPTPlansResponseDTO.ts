// src/types/dtos/ITrainerUsersPTPlansResponseDTO.ts

export interface ITrainerUserPurchaseDTO {
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

export interface ITrainerUserPlanDTO {
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
    totalPrice?: number | null;
    verifiedByAdmin: boolean;
  };
  purchase: ITrainerUserPurchaseDTO;
}

export interface ITrainerUserWithPlansDTO {
  user: {
    id: string;
    name: string;
    email: string;
    profilePic?: string | null;
    age?: number | null;
    gender?: string | null;
  };
  plans: ITrainerUserPlanDTO[];
}

export interface IGetTrainerUsersPTPlansResponseDTO {
  success: boolean;
  status: number;
  data?: ITrainerUserWithPlansDTO[];
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}
