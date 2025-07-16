import { HttpStatus } from '@/domain/enums/httpStatus.enum';

export interface IMarkNotificationReadResponseDTO {
  success: boolean;
  status: HttpStatus;
  message: string;
  error?: { code: string; message: string };
}

export interface IMarkNotificationReadUseCase {
  execute(userId: string, notificationId: string): Promise<IMarkNotificationReadResponseDTO>;
}