import { Email } from "../valueObjects/email.valueObject";

export interface IGetTrainerResponseDTO {
  trainer:TrainerAuth;
  message?: string; 
}

export interface TrainerAuth {

    id: string | null;
    email: string;
    name: string;
    role: string;
    isVerified: boolean;
    verifiedByAdmin: boolean;
    profilePic: string | null;
}