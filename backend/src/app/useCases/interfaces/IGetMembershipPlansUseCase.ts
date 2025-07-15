import { IGetMembershipPlansResponseDTO } from '@/domain/dtos/getMembershipPlansResponse.dto';

export interface IGetMembershipPlansUseCase {
  execute(page: number, limit: number): Promise<IGetMembershipPlansResponseDTO>;
}