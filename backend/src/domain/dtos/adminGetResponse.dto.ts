export interface IAdminGetResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      profilePic?: string | null;
    };
  };
  error?: { code: string; message: string };
}