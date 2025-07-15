import { IUpdateUserProfileRequestDTO } from '@/domain/dtos/updateUserProfileRequest.dto';
import { IUpdateUserProfileResponseDTO } from '@/domain/dtos/updateUserProfileResponse.dto';

export interface IUpdateUserProfileUseCase {
  execute(email: string, data: IUpdateUserProfileRequestDTO): Promise<IUpdateUserProfileResponseDTO>;
}