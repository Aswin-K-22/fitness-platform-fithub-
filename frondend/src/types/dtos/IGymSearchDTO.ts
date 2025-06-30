// src/domain/dtos/user/IGymSearchDTO.ts
export interface IGymSearchDTO {
  page: number;
  limit: number;
  search?: string;
  lat?: number; // User’s latitude
  lng?: number; // User’s longitude
  radius?: number; // Distance in km
  gymType?: string;
  rating?: string;
}