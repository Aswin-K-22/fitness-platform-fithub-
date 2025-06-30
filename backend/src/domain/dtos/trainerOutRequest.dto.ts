// backend/src/domain/dtos/trainerOutRequest.dto.ts
import { Email } from '../valueObjects/email.valueObject';

export interface ITrainerOutRequestDTO {
  id: string | null;
  email: Email; // Matches Trainer.email: Email
  name: string; // Matches Trainer.name: string
  role: string; // Matches Trainer.role: string
  isVerified: boolean; // Matches Trainer.isVerified: boolean
  verifiedByAdmin: boolean; 
  profilePic: string | null; 
}

// Generic Result type for use case responses
export interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
}