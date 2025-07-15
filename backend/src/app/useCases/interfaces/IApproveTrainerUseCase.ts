import { IApproveTrainerRequestDTO } from '@/domain/dtos/approveTrainerRequest.dto';
import { IApproveTrainerResponseDTO } from '@/domain/dtos/approveTrainerResponse.dto';

export interface IApproveTrainerUseCase {
  execute(data: IApproveTrainerRequestDTO): Promise<IApproveTrainerResponseDTO>;
}