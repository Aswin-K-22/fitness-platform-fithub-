import { IGetUserCurrentPlansResponseDTO } from "@/domain/dtos/user/getUserCurrentPlansResponse.dto";

export interface IGetUserCurrentPlansUseCase {
  execute(userId: string): Promise<IGetUserCurrentPlansResponseDTO>
}