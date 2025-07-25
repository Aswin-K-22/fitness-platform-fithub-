import { HttpStatus } from '@/domain/enums/httpStatus.enum';

export interface IStopPTPlanUseCaseInputDTO {
  planId: string;
  trainerId: string; // Add trainerId to input DTO
}

export interface IResumePTPlanUseCaseInputDTO {
  planId: string;
  trainerId: string; // Add trainerId to input DTO
}

export interface IStopPTPlanUseCaseResponseDTO {
  success: boolean;
  status: HttpStatus;
  message?: string;
  error?: { code: string; message: string };
}

export interface IResumePTPlanUseCaseResponseDTO {
  success: boolean;
  status: HttpStatus;
  message?: string;
  error?: { code: string; message: string };
}