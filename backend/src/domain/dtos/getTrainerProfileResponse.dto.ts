// src/domain/dtos/getTrainerProfileResponse.dto.ts
import { IResponseDTO } from './response.dto';
export interface IGetTrainerProfileResponseDTO extends IResponseDTO<{ trainer: TrainerProfile }> {}


export interface TrainerProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePic?: string | null;
  bio?: string | null;
  specialties?: string[];
  experienceLevel?: string | null;
  paymentDetails?: {
    ifscCode?: string | null;
    bankAccount?: string | null;
    upiId?: string | null;
    method?: string | null;
    rate?: number | null;
    currency?: string | null;
    paymentHistory?: {
      paymentId: string;
      amount: number;
      date: string;
      periodStart?: string | null;
      periodEnd?: string | null;
      clientCount?: number | null;
      hoursWorked?: number | null;
    }[];
  } | null;
  availability?: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  gyms?: string[];
  createdAt?: string;
  updatedAt?: string;
  verifiedByAdmin: boolean;
  certifications?: {
    name: string;
    issuer: string;
    dateEarned: string;
    filePath: string;
  }[];
  clients?: {
    userId: string;
    membershipId?: string | null;
    startDate: string;
    active: boolean;
  }[];
}

