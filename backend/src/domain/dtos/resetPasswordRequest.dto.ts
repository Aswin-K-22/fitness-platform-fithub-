// backend/src/domain/dtos/resetPasswordRequest.dto.ts
export interface IResetPasswordRequestDTO {
  email: string;
  otp: string;
  newPassword: string;
}