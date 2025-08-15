import { IGetUserPTPlansResponseDTO } from "@/domain/dtos/user/IUserPTPlanResponseDTO";

export interface IGetUserCurrentPTPlansUseCase {
  execute(userId: string): Promise<IGetUserPTPlansResponseDTO>;
}
