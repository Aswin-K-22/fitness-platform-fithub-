export interface TrainerAuth {
  id: string | null;
  email: string;
  name: string;
  role: string;
  isVerified: boolean;
  verifiedByAdmin: boolean;
  profilePic: string | null;
}

export interface IGetTrainerResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  data?: { trainer: TrainerAuth };
  error?: { code: string; message: string };
}