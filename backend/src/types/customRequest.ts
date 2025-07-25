// src/types/customRequest.ts
import { Request } from 'express';
import { AdminPTPlansRequestDTO } from '../domain/dtos/adminPTPlansRequestDTO';
import { CreatePTPlanRequestDTO } from '@/domain/dtos/createPTPlanRequest.dto';
import { ResumePTPlanRequestDTO, StopPTPlanRequestDTO } from '@/domain/dtos/stopResumePTPlanRequest.dto';
import { UpdateTrainerProfileRequestDTO } from '@/domain/dtos/updateTrainerProfileResponse.dto';
import { PTPlansRequestDTO } from '@/domain/dtos/pTPlanRequestDTO';
import { EditPTPlanRequestDTO } from '@/domain/dtos/editPTPlanRequest.dto';
import { VerifyPTPlanRequestDTO } from '@/domain/dtos/verifyPTPlanRequestDTO';
import { UpdateAdminPriceRequestDTO } from '@/domain/dtos/updateAdminPriceRequestDTO';

export interface CustomRequest extends Request {
  validatedData?:
    | CreatePTPlanRequestDTO
    | StopPTPlanRequestDTO
    | ResumePTPlanRequestDTO
    | UpdateTrainerProfileRequestDTO
    | AdminPTPlansRequestDTO
    | VerifyPTPlanRequestDTO
    |  UpdateAdminPriceRequestDTO
    | undefined;
  PTPlansGetRequestDTO?: PTPlansRequestDTO;
  editPTPlanRequestDTO?: EditPTPlanRequestDTO;
  trainer?: { id: string | null; email: string };
}