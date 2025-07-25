// src/app/useCases/admin/interfaces/IVerifyPTPlanUseCase.ts
import { IVerifyPTPlanRequestDTO } from '@/domain/dtos/verifyPTPlanRequestDTO';
import { IResponseDTO } from '@/domain/dtos/response.dto';

export interface IVerifyPTPlanUseCase {
  execute(data: IVerifyPTPlanRequestDTO): Promise<IResponseDTO<null>>;
}