import { Trainer } from '../../domain/entities/Trainer.entity';

export interface ICreateTrainerResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  data?: { trainer: Trainer };
  error?: { code: string; message: string };
}