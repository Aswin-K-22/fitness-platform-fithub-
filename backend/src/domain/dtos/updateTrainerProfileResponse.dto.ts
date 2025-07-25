
// src/domain/dtos/updateTrainerProfileResponse.dto.ts
import { z } from 'zod';
import { ERRORMESSAGES } from '../constants/errorMessages.constant';
import { IResponseDTO } from './response.dto';
export interface IUpdateTrainerProfileResponseDTO extends IResponseDTO<{ trainer: TrainerProfile }> {}

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



export interface IUpdateTrainerProfileRequestDTO {
  name?: string;
  bio?: string;
  specialties?: string[];
  profilePic?: string;
  upiId?: string;
  bankAccount?: string;
  ifscCode?: string;
}


// src/domain/dtos/updateTrainerProfileRequest.dto.ts


export interface IUpdateTrainerProfileFrondEndRequestDTO {
    name: string;
    bio: string;
    specialties: string[];
    upiId: string;
    bankAccount: string;
    ifscCode: string;
}

export const updateTrainerProfileSchema = z.object({
    name: z
        .string()
        .min(2, { message: ERRORMESSAGES.TRAINER_PROFILE_INVALID_NAME.message })
        .max(100, { message: 'Name cannot exceed 100 characters' })
        .nonempty({ message: ERRORMESSAGES.TRAINER_PROFILE_INVALID_NAME.message })
        .trim(),
    bio: z
        .string()
        .min(10, { message: 'Bio must be at least 10 characters long' })
        .max(1000, { message: 'Bio cannot exceed 1000 characters' })
        .nonempty({ message: ERRORMESSAGES.TRAINER_PROFILE_INVALID_BIO.message })
        .trim(),
    specialties: z
        .string()
        .transform((val) => {
            try {
                return JSON.parse(val);
            } catch {
                throw new Error(ERRORMESSAGES.TRAINER_PROFILE_INVALID_SPECIALTIES.message);
            }
        })
        .refine((val) => Array.isArray(val) && val.length > 0 && val.every((item) => typeof item === 'string'), {
            message: ERRORMESSAGES.TRAINER_PROFILE_INVALID_SPECIALTIES.message,
        }),
    upiId: z
        .string()
        .nonempty({ message: ERRORMESSAGES.TRAINER_PROFILE_INVALID_UPIID.message })
        .trim(),
    bankAccount: z
        .string()
        .nonempty({ message: ERRORMESSAGES.TRAINER_PROFILE_INVALID_BANKACCOUNT.message })
        .trim(),
    ifscCode: z
        .string()
        .nonempty({ message: ERRORMESSAGES.TRAINER_PROFILE_INVALID_IFSCCODE.message })
        .trim(),
});

export class UpdateTrainerProfileRequestDTO implements IUpdateTrainerProfileFrondEndRequestDTO {
    public name: string;
    public bio: string;
    public specialties: string[];
    public upiId: string;
    public bankAccount: string;
    public ifscCode: string;

    constructor(data: unknown) {
        const parsed = updateTrainerProfileSchema.safeParse(data);
        if (!parsed.success) {
            const errors = parsed.error.errors.map((err) => err.message).join(', ');
            throw new Error(errors);
        }
        this.name = parsed.data.name;
        this.bio = parsed.data.bio;
        this.specialties = parsed.data.specialties;
        this.upiId = parsed.data.upiId;
        this.bankAccount = parsed.data.bankAccount;
        this.ifscCode = parsed.data.ifscCode;
    }
}


export interface IUpdateTrainerProfileUseCaseDTO {
  name: string;
  bio: string;
  specialties: string[];
  profilePic: string | null;
  upiId: string;
  bankAccount: string;
  ifscCode: string;
}