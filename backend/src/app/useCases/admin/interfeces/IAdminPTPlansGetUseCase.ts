// src/app/useCases/admin/interfaces/IAdminPTPlansGetUseCase.ts
import { IAdminPTPlansRequestDTO } from '@/domain/dtos/adminPTPlansRequestDTO';
import { IGetPTPlansResponseDTO } from '@/domain/dtos/getPTPlansResponse.dto';

export interface IAdminPTPlansGetUseCase {
  execute(data: IAdminPTPlansRequestDTO): Promise<IGetPTPlansResponseDTO>;
}