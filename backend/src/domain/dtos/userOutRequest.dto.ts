export interface IUserOutRequestDTO {
  id: string;
  email: string;
  name: string;
  role: string;
  isVerified: boolean;
  profilePic?: string;
}