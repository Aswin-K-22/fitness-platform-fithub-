

// backend/src/domain/dtos/resendOtpRequest.dto.ts

import { AuthErrorType } from '../enums/authErrorType.enum';


export interface IResendOtpRequestDTO {
  email: string;
}


export class ResendOtpRequestDTO {
  public email: string;

  constructor(data: IResendOtpRequestDTO) {
    this.email = data.email?.trim() || '';

    this.validate();
  }

  private validate(): void {
    if (!this.email) {
      throw new Error(AuthErrorType.MissingEmail);
    }
  }
}