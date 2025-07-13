export interface ILogoutUserResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  error?: { code: string; message: string };
}

export interface ILogoutRequestDTO {
  email: string;
}