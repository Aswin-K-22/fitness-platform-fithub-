// backend/src/domain/dtos/getGymsResponse.dto.ts

export interface GymDTO {
  id: string;
  name: string;
  type?: string;
  description?: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    lat?: number;
    lng?: number;
    street?: string;
  };
  image?: string; 
  ratings?: {
    average?: number;
    count?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface IGetGymsResponseDTO {
  success: boolean;
  gyms: GymDTO[];
  page: number;
  totalPages: number;
  totalGyms: number;
}