import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { z } from 'zod';

export interface IUpdateUserProfileRequestDTO {
  name?: string;
  profilePic?: File;
}

export const UpdateUserProfileRequest = z.object({
  name: z
    .string()
    .min(2, { message: ERRORMESSAGES.USER_INVALID_NAME.message })
    .max(100, { message: ERRORMESSAGES.USER_INVALID_NAME.message })
    .optional(),
  profilePic: z
    .any()
    .refine((file) => !file || (file instanceof File && ['image/jpeg', 'image/png'].includes(file.type)), {
      message: ERRORMESSAGES.USER_INVALID_PROFILE_PIC.message,
    })
    .optional(),
}).refine((data) => data.name || data.profilePic, {
  message: ERRORMESSAGES.USER_NO_VALID_FIELDS_PROVIDED.message,
  path: ['name', 'profilePic'],
});

export class UpdateUserProfileRequestDTO implements IUpdateUserProfileRequestDTO {
  public name?: string;
  public profilePic?: File;

  constructor(data: unknown) {
    const parsed = UpdateUserProfileRequest.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((err) => err.message).join(', ');
      throw new Error(errors);
    }
    this.name = parsed.data.name;
    this.profilePic = parsed.data.profilePic;
  }

  toEntity(): IUpdateUserProfileRequestDTO {
    return {
      name: this.name,
      profilePic: this.profilePic,
    };
  }
}