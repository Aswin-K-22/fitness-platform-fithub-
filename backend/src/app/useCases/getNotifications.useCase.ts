import { Notification } from '@/domain/entities/Notification.entity';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { MESSAGES } from '@/domain/constants/messages.constant';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { INotificationsRepository } from '../repositories/notifications.repository';
import { IGetNotificationsUseCase } from './interfaces/IGetNotificationsUseCase';

export interface IGetNotificationsResponseDTO {
  success: boolean;
  status: HttpStatus;
  message: string;
  data?: { notifications: Notification[] };
  error?: { code: string; message: string };
}



export class GetNotificationsUseCase implements IGetNotificationsUseCase {
  constructor(private notificationsRepository: INotificationsRepository) {}

  async execute(userId: string, page: number = 1, limit: number = 10): Promise<IGetNotificationsResponseDTO> {
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

      const notifications = await this.notificationsRepository.findByUserId(userId, page, limit);

      if (!notifications.length) {
        return {
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: ERRORMESSAGES.NOTIFICATIONS_NOT_FOUND.message,
          error: {
            code: ERRORMESSAGES.NOTIFICATIONS_NOT_FOUND.code,
            message: ERRORMESSAGES.NOTIFICATIONS_NOT_FOUND.message,
          },
        };
      }

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.NOTIFICATIONS_FETCHED,
        data: { notifications: notifications.map(n => n.toJSON()) },
      };
    } catch (error) {
      console.error('[GetNotificationsUseCase] Error:', error);
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: ERRORMESSAGES.GENERIC_ERROR.message,

        error: {
          code: ERRORMESSAGES.GENERIC_ERROR.code,
          message: ERRORMESSAGES.GENERIC_ERROR.message,
        },
      };
    }
  }
}