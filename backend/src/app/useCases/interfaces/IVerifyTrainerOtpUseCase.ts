import { IVerifyTrainerOtpRequestDTO } from '@/domain/dtos/verifyTrainerOtpRequest.dto';
import { IVerifyTrainerOtpResponseDTO } from '@/domain/dtos/verifyTrainerOtpResponse.dto';

export interface IVerifyTrainerOtpUseCase {
  execute(data: IVerifyTrainerOtpRequestDTO): Promise<IVerifyTrainerOtpResponseDTO>;
}