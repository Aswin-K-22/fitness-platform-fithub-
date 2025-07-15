import { IGetUserProfileResponseDTO } from '@/domain/dtos/getUserProfile.dto';

export interface IGetUserProfileUseCase {
  execute(email: string): Promise<IGetUserProfileResponseDTO>;
}