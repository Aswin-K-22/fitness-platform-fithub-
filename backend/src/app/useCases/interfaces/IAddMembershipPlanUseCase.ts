import { IAddMembershipPlanRequestDTO } from '@/domain/dtos/IAddMembershipPlanRequestDTO';
import { IAddMembershipPlanResponseDTO } from '@/domain/dtos/IAddMembershipPlanResponseDTO';

export interface IAddMembershipPlanUseCase {
  execute(data: IAddMembershipPlanRequestDTO): Promise<IAddMembershipPlanResponseDTO>;
}