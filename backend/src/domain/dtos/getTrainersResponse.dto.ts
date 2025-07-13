export interface TrainerResponseDTO {
  id: string;
  name: string;
  email: string;
  specialties: string[];
  experienceLevel: string | null;
  verifiedByAdmin: boolean;
  isVerified: boolean;
  profilePic: string | null;
  certifications: {
    name: string;
    issuer: string;
    dateEarned: Date;
    filePath: string;
  }[];
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGetTrainersResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  data?: {
    trainers: TrainerResponseDTO[];
    stats: {
      totalTrainers: number;
      pendingApproval: number;
      activeTrainers: number;
      suspended: number;
    };
    totalPages: number;
  };
  error?: { code: string; message: string };
}