export interface IResetPasswordResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  error?: { code: string; message: string };
}

export interface IResetPasswordRequestDTO {
  email: string;
  otp: string;
  newPassword: string;
}