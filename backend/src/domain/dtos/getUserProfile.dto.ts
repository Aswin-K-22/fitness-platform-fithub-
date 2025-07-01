


import { UserProfileDataDTO } from './getUserProfileResoponse.dto';
import { UserAuthResponseDTO } from './userAuthResponse.dto';

export interface GetUserProfileResponseDTO {
  success: boolean;
  data?: {
    user:  UserProfileDataDTO;
    
  };
  error?: string;
}

