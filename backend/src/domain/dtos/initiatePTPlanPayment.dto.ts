// src/domain/dtos/initiatePTPlanPayment.dto.ts
export interface InitiatePTPlanPaymentRequestDTO {
  planId: string;
}

export interface IInitiatePTPlanPaymentResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  data?: {
    orderId: string;
    amount: number;
    currency: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

