export interface InitiateMembershipPaymentRequestDTO {
  planId: string;
}

export interface InitiateMembershipPaymentResponseDTO {
  success: boolean;
  orderId: string;
  amount: number;
  currency: string;
}