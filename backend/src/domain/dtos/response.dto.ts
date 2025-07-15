
// src/domain/dtos/response.dto.ts
import { HttpStatus } from "../enums/httpStatus.enum";


export interface IResponseDTO<T> {
  success: boolean;
  status: HttpStatus;
  message?: string;
  data?: T;
  error?: { code: string; message: string };
}