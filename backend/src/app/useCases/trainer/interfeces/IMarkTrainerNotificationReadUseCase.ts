import { HttpStatus } from '@/domain/enums/httpStatus.enum';

export interface IMarkTrainerNotificationReadResponseDTO {
  success: boolean;
  status: HttpStatus;
  message: string;
  error?: { code: string; message: string };
}

export interface IMarkTrainerNotificationReadUseCase {
  execute(trainerId: string, notificationId: string): Promise<IMarkTrainerNotificationReadResponseDTO>;
}
