// src/domain/dtos/admin/IGetGymsResponseDTO.ts

import type { Gym } from "../gym.types";

export interface IGetGymsResponseDTO {
  gyms: Gym[];
  total: number;
  totalPages: number;
}