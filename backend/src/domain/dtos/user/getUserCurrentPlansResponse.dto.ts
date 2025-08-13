// src/domain/dtos/getUserCurrentPlansResponse.dto.ts
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { Membership } from '@/domain/entities/Membership.entity';

export interface IGetUserCurrentPlansResponseDTO {
  success: boolean;
  status: HttpStatus;
  message?: string;
  data: {
    memberships: ReturnType<Membership['toJSON']>[]; // plain objects, not entity instances
  };
  error?: { code: string; message: string };
}
