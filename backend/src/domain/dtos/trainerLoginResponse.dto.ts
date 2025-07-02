import { Email } from "../valueObjects/email.valueObject";

export interface ILoginResponseDTO {
  trainer: {
    id: string | null;
    email: Email;
    name: string;
    role: 'trainer';
    isVerified: boolean;
    verifiedByAdmin: boolean;
    profilePic: string | null;
  };
  message?: string; 
}