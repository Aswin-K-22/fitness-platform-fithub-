import { AddGymRequestDTO } from '@/domain/dtos/addGymRequest.dto';
import { AddGymResponseDTO } from '@/domain/dtos/addGymResponse.dto';

export interface IAddGymUseCase {
  execute(gymData: AddGymRequestDTO, imageUrls: string[]): Promise<AddGymResponseDTO>;
}