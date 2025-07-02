import { AuthErrorType } from '../enums/authErrorType.enum';

export interface IVerifyTrainerOtpRequestDTO {
  email: string;
  otp: string;
}

export class VerifyTrainerOtpRequestDTO {
  public email: string;
  public otp: string;

  constructor(data: IVerifyTrainerOtpRequestDTO) {
    this.email = data.email?.trim() || '';
    this.otp = data.otp?.trim() || '';

    this.validate();
  }

  private validate(): void {
    if (!this.email) {
      throw new Error(AuthErrorType.MissingEmail);
    }
    if (!this.otp || !/^\d{6}$/.test(this.otp)) {
      throw new Error(AuthErrorType.MissingOtp);
    }
  }
}