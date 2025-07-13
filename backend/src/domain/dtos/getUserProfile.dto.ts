


import { UserProfileDataDTO } from './getUserProfileResoponse.dto';

export interface IGetUserProfileResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  data?: { user: UserProfileDataDTO };
  error?: { code: string; message: string };
}
