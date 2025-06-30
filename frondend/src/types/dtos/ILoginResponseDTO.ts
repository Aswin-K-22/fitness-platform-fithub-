// src/domain/dtos/ILoginResponseDTO.ts

// src/domain/dtos/ILoginResponseDTO.ts
import type { UserAuth } from "../auth.types";

export interface ILoginResponseDTO {
  user?: UserAuth;
  trainer?: UserAuth;
  admin?:UserAuth;
}