export interface IInitiateMembershipPaymentResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  data?: { orderId: string; amount: number; currency: string };
  error?: { code: string; message: string };
}

export interface InitiateMembershipPaymentRequestDTO {
  planId: string;
}