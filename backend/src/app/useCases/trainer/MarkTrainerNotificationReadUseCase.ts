import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { MESSAGES } from '@/domain/constants/messages.constant';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { NotificationService as TrainerNotificationService  } from '@/infra/providers/notification.service';
import { IMarkTrainerNotificationReadUseCase } from './interfeces/IMarkTrainerNotificationReadUseCase';

export interface IMarkTrainerNotificationReadResponseDTO {
  success: boolean;
  status: HttpStatus;
  message: string;
  error?: { code: string; message: string };
}

export class MarkTrainerNotificationReadUseCase implements IMarkTrainerNotificationReadUseCase {
  constructor(private trainerNotificationService: TrainerNotificationService) {}

  async execute(trainerId: string, notificationId: string): Promise<IMarkTrainerNotificationReadResponseDTO> {
    try {
      if (!trainerId) {
        return {
          success: false,
          status: HttpStatus.UNAUTHORIZED,
          message: ERRORMESSAGES.NOTIFICATION_UNAUTHORIZED.message,
          error: {
            code: ERRORMESSAGES.NOTIFICATION_UNAUTHORIZED.code,
            message: ERRORMESSAGES.NOTIFICATION_UNAUTHORIZED.message,
          },
        };
      }

      await this.trainerNotificationService.markAsReadAndEmit(notificationId, trainerId);

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.NOTIFICATION_MARKED_READ,
      };
    } catch (error) {
      console.error('[MarkTrainerNotificationReadUseCase] Error:', error);
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ERRORMESSAGES.NOTIFICATION_MARK_READ_FAILED.message,
        error: {
          code: ERRORMESSAGES.NOTIFICATION_MARK_READ_FAILED.code,
          message: ERRORMESSAGES.NOTIFICATION_MARK_READ_FAILED.message,
        },
      };
    }
  }
}
