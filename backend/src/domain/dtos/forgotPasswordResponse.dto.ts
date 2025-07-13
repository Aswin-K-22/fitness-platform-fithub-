export interface IForgotPasswordResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  data?: {};
  error?: { code: string; message: string };
}