import { GetGymDetailsRequestDTO } from '@/domain/dtos/getGymDetailsRequest.dto';
import { IGetGymDetailsResponseDTO } from '@/domain/dtos/getGymDetailsResponse.dto';

export interface IGetGymDetailsUseCase {
  execute(data: GetGymDetailsRequestDTO): Promise<IGetGymDetailsResponseDTO>;
}