import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { z } from 'zod';

export interface ICreateUserRequestDTO {
  name: string;
  email: string;
  password: string;
}

export const CreateUserRequest = z.object({
  name: z
    .string()
    .min(2, { message: ERRORMESSAGES.USER_INVALID_NAME.message })
    .max(100, { message: ERRORMESSAGES.USER_INVALID_NAME.message }),
  email: z
    .string()
    .email({ message: ERRORMESSAGES.AUTH_INVALID_EMAIL.message }),
  password: z
    .string()
    .min(6, { message: ERRORMESSAGES.USER_INVALID_PASSWORD.message })
});

export class CreateUserRequestDTO implements ICreateUserRequestDTO {
  public name: string;
  public email: string;
  public password: string;

  constructor(data: unknown) {
    const parsed = CreateUserRequest.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((err) => err.message).join(', ');
      throw new Error(errors);
    }
    this.name = parsed.data.name;
    this.email = parsed.data.email;
    this.password = parsed.data.password;
  }

  toEntity(): ICreateUserRequestDTO {
    return {
      name: this.name,
      email: this.email,
      password: this.password,
    };
  }
}