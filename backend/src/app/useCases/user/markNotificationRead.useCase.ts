import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { MESSAGES } from '@/domain/constants/messages.constant';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { INotificationsRepository } from '../../repositories/notifications.repository';
import { IMarkNotificationReadUseCase } from '../interfaces/IMarkNotificationReadUseCase';
import { NotificationService } from '@/infra/providers/notification.service';

export interface IMarkNotificationReadResponseDTO {
  success: boolean;
  status: HttpStatus;
  message: string;
  error?: { code: string; message: string };
}



export class MarkNotificationReadUseCase implements IMarkNotificationReadUseCase {
 constructor(private notificationService: NotificationService) {}

  async execute(userId: string, notificationId: string): Promise<IMarkNotificationReadResponseDTO> {
    try {
      if (!userId) {
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

        await this.notificationService.markAsReadAndEmit(notificationId, userId);
      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.NOTIFICATION_MARKED_READ,
      };
    } catch (error) {
      console.error('[MarkNotificationReadUseCase] Error:', error);
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