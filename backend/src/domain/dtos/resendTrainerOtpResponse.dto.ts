export interface IResendTrainerOtpResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  error?: { code: string; message: string };
}

export interface IResendOtpRequestDTO {
  email: string;
}