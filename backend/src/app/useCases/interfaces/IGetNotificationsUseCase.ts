import { Notification } from '@/domain/entities/Notification.entity';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';

export interface IGetNotificationsResponseDTO {
  success: boolean;
  status: HttpStatus;
  message: string;
  data?: { notifications: Notification[] };
  error?: { code: string; message: string };
}

export interface IGetNotificationsUseCase {
  execute(userId: string, page: number, limit: number): Promise<IGetNotificationsResponseDTO>;
}