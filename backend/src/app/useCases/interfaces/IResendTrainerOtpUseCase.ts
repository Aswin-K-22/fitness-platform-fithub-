import { IResendOtpRequestDTO } from '@/domain/dtos/resendOtpRequest.dto';
import { IResendTrainerOtpResponseDTO } from '@/domain/dtos/resendTrainerOtpResponse.dto';

export interface IResendTrainerOtpUseCase {
  execute(data: IResendOtpRequestDTO): Promise<IResendTrainerOtpResponseDTO>;
}