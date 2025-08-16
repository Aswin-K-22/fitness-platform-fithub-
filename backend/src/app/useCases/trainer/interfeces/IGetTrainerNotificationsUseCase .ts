import { Notification } from '@/domain/entities/Notification.entity';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';

export interface IGetTrainerNotificationsResponseDTO {
  success: boolean;
  status: HttpStatus;
  message: string;
  data?: { notifications: Notification[] };
  error?: { code: string; message: string };
}

export interface IGetTrainerNotificationsUseCase {
  execute(trainerId: string, page: number, limit: number): Promise<IGetTrainerNotificationsResponseDTO>;
}
