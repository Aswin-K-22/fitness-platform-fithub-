// src/types/express.d.ts
import { CreatePTPlanRequestDTO } from '@/domain/dtos/createPTPlanRequest.dto';

declare module 'express' {
  interface Request {
    validatedData?: CreatePTPlanRequestDTO | any; 
    trainer?: { id: string | null; email: string };
  }
}