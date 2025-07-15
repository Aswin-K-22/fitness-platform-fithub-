import { IAdminGetResponseDTO } from '@/domain/dtos/adminGetResponse.dto';

export interface IGetAdminUseCase {
  execute(email: string): Promise<IAdminGetResponseDTO>;
}