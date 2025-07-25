import { IUpdateAdminPriceRequestDTO } from '@/domain/dtos/updateAdminPriceRequestDTO';
import { IResponseDTO } from '@/domain/dtos/response.dto';

export interface IUpdatePTPlanAdminPriceUseCase {
  execute(data: IUpdateAdminPriceRequestDTO): Promise<IResponseDTO<null>>;
}