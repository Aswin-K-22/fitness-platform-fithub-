export interface ILoginTrainerResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  data?: {
    trainer: {
      id: string | null;
      email: string;
      name: string;
      role: 'trainer';
      isVerified: boolean;
      verifiedByAdmin: boolean;
      profilePic: string | null;
    };
    accessToken: string;
    refreshToken: string;
  };
  error?: { code: string; message: string };
}

export interface ILoginRequestDTO {
  email: string;
  password: string;
}