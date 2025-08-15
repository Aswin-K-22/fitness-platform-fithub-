import { IInitiatePTPlanPaymentResponseDTO, InitiatePTPlanPaymentRequestDTO } from "@/domain/dtos/initiatePTPlanPayment.dto";

export interface IInitiatePTPlanPaymentUseCase {
  execute(data: InitiatePTPlanPaymentRequestDTO, userId: string): Promise<IInitiatePTPlanPaymentResponseDTO>;
}