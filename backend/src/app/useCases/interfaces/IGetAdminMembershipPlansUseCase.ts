import { IGetAdminMembershipPlansRequestDTO } from '@/domain/dtos/getAdminMembershipPlansRequest.dto';
import { IGetAdminMembershipPlansResponseDTO } from '@/domain/dtos/getAdminMembershipPlansResponse.dto';

export interface IGetAdminMembershipPlansUseCase {
  execute(data: IGetAdminMembershipPlansRequestDTO): Promise<IGetAdminMembershipPlansResponseDTO>;
}