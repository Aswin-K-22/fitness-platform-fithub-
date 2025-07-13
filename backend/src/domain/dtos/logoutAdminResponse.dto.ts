export interface IAdminLogoutResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  error?: { code: string; message: string };
}

export interface IAdminLogoutRequestDTO {
  email: string;
}