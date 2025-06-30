// src/domain/dtos/admin/IGetTrainersResponseDTO.ts
import { Trainer } from "../../entities/admin/Trainer";

export interface IGetTrainersResponseDTO {
  trainers: Trainer[];
  stats: {
    totalTrainers: number;
    pendingApproval: number;
    activeTrainers: number;
    suspended: number;
  };
  totalPages: number;
}