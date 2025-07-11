// src/domain/dtos/ILoginResponseDTO.ts

// src/domain/dtos/ILoginResponseDTO.ts
import type { TrainerAuth, UserAuth } from "../auth.types";

export interface ILoginResponseDTO {
  user?: UserAuth;
  trainer?: TrainerAuth;
  admin?:UserAuth;
}