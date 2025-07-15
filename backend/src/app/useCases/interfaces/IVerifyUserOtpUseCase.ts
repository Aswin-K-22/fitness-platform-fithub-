import { IVerifyOtpRequestDTO } from '@/domain/dtos/verifyOtpRequest.dto';
import { IVerifyUserOtpResponseDTO } from '@/domain/dtos/verifyUserOtpResponse.dto';

export interface IVerifyUserOtpUseCase {
  execute(data: IVerifyOtpRequestDTO): Promise<IVerifyUserOtpResponseDTO>;
}