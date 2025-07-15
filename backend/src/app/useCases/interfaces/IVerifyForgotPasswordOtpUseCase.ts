import { IVerifyOtpRequestDTO } from '@/domain/dtos/verifyOtpRequest.dto';
import { IVerifyForgotPasswordOtpResponseDTO } from '@/domain/dtos/verifyForgotPasswordOtpResponse.dto';

export interface IVerifyForgotPasswordOtpUseCase {
  execute(data: IVerifyOtpRequestDTO): Promise<IVerifyForgotPasswordOtpResponseDTO>;
}