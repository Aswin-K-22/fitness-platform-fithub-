// src/domain/dtos/IUserProfileDTO.ts
export interface IUserProfileDTO {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "trainer";
}