//src/app/usecases/user/interfaces/IPTPlansUserGetUseCase.ts
import { IGetPTPlansResponseDTO } from '@/domain/dtos/getPTPlansResponse.dto';
import { IUserPTPlansRequestDTO } from '@/domain/dtos/user/userPTPlanRequestDTO';

export interface IPTPlansUserGetUseCase {
  execute(data:  IUserPTPlansRequestDTO): Promise<IGetPTPlansResponseDTO>;
}