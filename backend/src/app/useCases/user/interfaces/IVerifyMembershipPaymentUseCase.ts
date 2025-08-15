import { VerifyMembershipPaymentRequestDTO, IVerifyMembershipPaymentResponseDTO } from '@/domain/dtos/verifyMembershipPayment.dto';

export interface IVerifyMembershipPaymentUseCase {
  execute(data: VerifyMembershipPaymentRequestDTO, userId: string): Promise<IVerifyMembershipPaymentResponseDTO>;
}