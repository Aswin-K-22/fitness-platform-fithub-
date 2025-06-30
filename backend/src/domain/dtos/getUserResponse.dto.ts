import { UserAuthResponseDTO } from './userAuthResponse.dto';

export interface GetUserResponseDTO {
  success: boolean;
  data?: {
    user: UserAuthResponseDTO;
    
  };
  error?: string;
}