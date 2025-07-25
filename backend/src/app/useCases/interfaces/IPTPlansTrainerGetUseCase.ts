//src/app/useCases/interfaces/IPTPlansTrainerGetUseCase.ts
import { IPTPlansRequestDTO } from '@/domain/dtos/pTPlanRequestDTO';
import { IGetPTPlansResponseDTO } from '@/domain/dtos/getPTPlansResponse.dto';

export interface IPTPlansTrainerGetUseCase {
  execute(data: IPTPlansRequestDTO, trainerId: string): Promise<IGetPTPlansResponseDTO>;
}