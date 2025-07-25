export interface IAdminLoginResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  data?: {
    admin: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
    accessToken: string;
    refreshToken: string;
  };
  error?: { code: string; message: string };
}