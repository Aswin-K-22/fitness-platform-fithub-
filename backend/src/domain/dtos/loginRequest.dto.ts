import { AuthErrorType } from '../enums/authErrorType.enum';

export interface ILoginRequestDTO {
  email: string;
  password: string;
}

export class LoginRequestDTO {
  public email: string;
  public password: string;

  constructor(data: ILoginRequestDTO) {
    this.email = data.email?.trim() || '';
    this.password = data.password?.trim() || '';

    this.validate();
  }

  private validate(): void {
    if (!this.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.email)) {
      throw new Error(AuthErrorType.MissingEmail);
    }
    if (!this.password || this.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
  }
}