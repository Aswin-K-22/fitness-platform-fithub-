// src/domain/dtos/trainer/ITrainerSignupRequestDTO.ts
export interface ITrainerSignupRequestDTO {
    name: string;
    email: string;
    password: string;
    specialties: string[];
    experienceLevel: string;
    bio: string;
    certifications: { name: string; issuer: string; dateEarned: string; file: File }[];
  }