export interface IAdminGetResponseDTO {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    profilePic?: string | null;
  };
}