import { IVerifyPTPlanPaymentResponseDTO, VerifyPTPlanPaymentRequestDTO } from "@/domain/dtos/verifyPTPlanPayment.dto";

export interface IVerifyPTPlanPaymentUseCase {
  execute(data: VerifyPTPlanPaymentRequestDTO, userId: string): Promise<IVerifyPTPlanPaymentResponseDTO>;
}