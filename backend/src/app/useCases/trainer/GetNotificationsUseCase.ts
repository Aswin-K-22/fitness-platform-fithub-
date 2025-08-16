import { Notification } from '@/domain/entities/Notification.entity';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { MESSAGES } from '@/domain/constants/messages.constant';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { IGetTrainerNotificationsUseCase } from './interfeces/IGetTrainerNotificationsUseCase ';
import { INotificationsRepository as ITrainerNotificationsRepository  } from '@/app/repositories/notifications.repository';
export interface IGetTrainerNotificationsResponseDTO {
  success: boolean;
  status: HttpStatus;
  message: string;
  data?: { notifications: Notification[] };
  error?: { code: string; message: string };
}

export class GetTrainerNotificationsUseCase implements IGetTrainerNotificationsUseCase {
  constructor(private trainerNotificationsRepository: ITrainerNotificationsRepository) {}

  async execute(trainerId: string, page: number = 1, limit: number = 10): Promise<IGetTrainerNotificationsResponseDTO> {
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

      const notifications = await this.trainerNotificationsRepository.findByUserId(trainerId, page, limit);

      if (!notifications.length) {
        return {
          success: true,
          status: HttpStatus.OK,
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
      console.error('[GetTrainerNotificationsUseCase] Error:', error);
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
