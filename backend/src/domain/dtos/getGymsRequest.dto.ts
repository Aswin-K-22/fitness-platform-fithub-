export interface GetGymsRequestDTO {
  page?: number;
  limit?: number;
  search?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  gymType?: string;
  rating?: string;
}