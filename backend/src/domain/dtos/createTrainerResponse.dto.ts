// src/domain/dtos/createTrainerResponse.dto.ts
import { Trainer } from '../entities/Trainer.entity';
import { IResponseDTO } from './response.dto';

export interface ICreateTrainerResponseDTO extends IResponseDTO<{ trainer: Trainer }> {}