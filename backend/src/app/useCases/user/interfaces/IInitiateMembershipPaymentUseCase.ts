import { InitiateMembershipPaymentRequestDTO, IInitiateMembershipPaymentResponseDTO } from '@/domain/dtos/initiateMembershipPayment.dto';

export interface IInitiateMembershipPaymentUseCase {
  execute(data: InitiateMembershipPaymentRequestDTO, userId: string): Promise<IInitiateMembershipPaymentResponseDTO>;
}