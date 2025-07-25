import { TrainerResponseDTO } from '@/domain/dtos/getTrainersResponse.dto';
import { IResponseDTO } from '@/domain/dtos/response.dto';
import { IUpdateTrainerProfileResponseDTO, IUpdateTrainerProfileUseCaseDTO } from '@/domain/dtos/updateTrainerProfileResponse.dto';

export interface IUpdateTrainerProfileUseCase {
  execute( data: IUpdateTrainerProfileUseCaseDTO,trainerId: string): Promise<IResponseDTO<TrainerResponseDTO>>;
}