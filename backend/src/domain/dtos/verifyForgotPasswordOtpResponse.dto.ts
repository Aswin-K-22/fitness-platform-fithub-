export interface IVerifyForgotPasswordOtpResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  error?: { code: string; message: string };
}