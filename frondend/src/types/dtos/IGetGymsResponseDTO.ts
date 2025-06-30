// src/domain/dtos/admin/IGetGymsResponseDTO.ts
import { Gym } from "../../entities/common/Gym";

export interface IGetGymsResponseDTO {
  gyms: Gym[];
  total: number;
  totalPages: number;
}