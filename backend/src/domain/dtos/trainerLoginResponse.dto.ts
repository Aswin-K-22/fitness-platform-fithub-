import { TrainerAuth } from "./getTrainerResponse.dto";
import { IResponseDTO } from "./response.dto";

// src/domain/dtos/loginTrainerResponse.dto.ts
export interface ILoginTrainerResponseDTO extends IResponseDTO<ITrainer> {}

export interface ILoginRequestDTO {
  email: string;
  password: string;
}

export interface ITrainer {
 trainer:TrainerAuth
    accessToken: string;
    refreshToken: string;
  
}