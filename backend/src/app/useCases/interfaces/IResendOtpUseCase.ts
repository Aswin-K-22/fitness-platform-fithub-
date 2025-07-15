import { IResendOtpRequestDTO } from '@/domain/dtos/resendOtpRequest.dto';
import { IResendOtpResponseDTO } from '@/domain/dtos/resendOtpResponse.dto';

export interface IResendOtpUseCase {
  execute(data: IResendOtpRequestDTO): Promise<IResendOtpResponseDTO>;
}