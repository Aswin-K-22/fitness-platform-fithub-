// src/domain/dtos/admin/IGetTrainersResponseDTO.ts

import type { Trainer } from "../trainer.type";

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