// src/domain/dtos/IUpdateTrainerProfileRequestDTO.ts
export interface IUpdateTrainerProfileRequestDTO {
    name?: string;
    bio?: string;
    specialties?: string[];
    profilePic?: File;
    upiId?: string;
    bankAccount?: string;
    ifscCode?: string;
  }