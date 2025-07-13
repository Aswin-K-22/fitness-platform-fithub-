export interface ILogoutResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  error?: { code: string; message: string };
}