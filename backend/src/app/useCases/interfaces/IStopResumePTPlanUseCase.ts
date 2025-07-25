import { IStopPTPlanUseCaseInputDTO, IStopPTPlanUseCaseResponseDTO } from '@/domain/dtos/stopResumePTPlanUseCase.dto';
import { IResumePTPlanUseCaseInputDTO, IResumePTPlanUseCaseResponseDTO } from '@/domain/dtos/stopResumePTPlanUseCase.dto';

export interface IStopPTPlanUseCase {
  execute(data: IStopPTPlanUseCaseInputDTO): Promise<IStopPTPlanUseCaseResponseDTO>;
}

export interface IResumePTPlanUseCase {
  execute(data: IResumePTPlanUseCaseInputDTO): Promise<IResumePTPlanUseCaseResponseDTO>;
}