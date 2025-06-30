// backend/src/domain/dtos/userAuthResponse.dto.ts
export interface UserAuthResponseDTO {
  id: string;
  email?: string;
  name?: string;
  role?: 'user' | 'admin' | 'trainer';
  profilePic?: string | null;
  isVerified?: boolean;
}