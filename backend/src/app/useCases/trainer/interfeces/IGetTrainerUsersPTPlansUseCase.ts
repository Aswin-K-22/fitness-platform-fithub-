import { IGetTrainerUsersPTPlansResponseDTO } from "@/domain/dtos/trainer/IGetTrainerUsersPTPlansResponseDTO";

export interface IGetTrainerUsersPTPlansUseCase {
  execute(trainerId: string): Promise<IGetTrainerUsersPTPlansResponseDTO>;
}
