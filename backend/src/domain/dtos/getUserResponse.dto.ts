export interface UserAuthResponseDTO {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'trainer';
  profilePic: string | null | undefined;
  isVerified: boolean;
}

export interface IGetUserResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  data?: {
    user: UserAuthResponseDTO;
  };
  error?: { code: string; message: string };
}