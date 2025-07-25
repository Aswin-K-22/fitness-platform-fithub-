import { IEditPTPlanRequestToEntity } from "@/domain/dtos/editPTPlanRequest.dto";
import { IResponseDTO } from "@/domain/dtos/response.dto";
import { PTPlan } from "@/domain/entities/PTPlan.entity";

export interface IEditPTPlanUseCase {
  execute(data: IEditPTPlanRequestToEntity, planId: string, trainerId: string): Promise<IResponseDTO<PTPlan>>;
}