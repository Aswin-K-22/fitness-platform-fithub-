import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { PTPlan } from '@/domain/entities/PTPlan.entity';

export interface IGetPTPlansResponseDTO {
  success: boolean;
  status: HttpStatus;
  message?: string;
  data: {
    plans: PTPlan[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: { code: string; message: string };
}