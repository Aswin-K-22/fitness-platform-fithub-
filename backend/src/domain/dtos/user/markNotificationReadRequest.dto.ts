import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { z } from 'zod';

export interface IMarkNotificationReadRequestDTO {
  notificationId: string;
}

export const MarkNotificationReadRequest = z.object({
  notificationId: z
    .string()
    .min(1, { message: ERRORMESSAGES.NOTIFICATION_INVALID_ID.message }),
});

export class MarkNotificationReadRequestDTO implements IMarkNotificationReadRequestDTO {
  public notificationId: string;

  constructor(data: unknown) {
    const parsed = MarkNotificationReadRequest.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((err) => err.message).join(', ');
      throw new Error(errors);
    }
    this.notificationId = parsed.data.notificationId;
  }

  toEntity(): IMarkNotificationReadRequestDTO {
    return {
      notificationId: this.notificationId,
    };
  }
}