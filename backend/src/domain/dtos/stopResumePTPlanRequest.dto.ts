import { z } from 'zod';
import { ERRORMESSAGES } from '../constants/errorMessages.constant';

export interface IStopPTPlanRequestDTO {
  planId: string;
}

export interface IResumePTPlanRequestDTO {
  planId: string;
}

export const stopPTPlanSchema = z.object({
  planId: z
    .string()
    .nonempty({ message: ERRORMESSAGES.PTPLAN_INVALID_ID.message }),
});

export const resumePTPlanSchema = z.object({
  planId: z
    .string()
    .nonempty({ message: ERRORMESSAGES.PTPLAN_INVALID_ID.message }),
});

export class StopPTPlanRequestDTO implements IStopPTPlanRequestDTO {
  public planId: string;

  constructor(data: unknown) {
    const parsed = stopPTPlanSchema.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((err) => err.message).join(', ');
      throw new Error(errors);
    }
    this.planId = parsed.data.planId;
  }
}

export class ResumePTPlanRequestDTO implements IResumePTPlanRequestDTO {
  public planId: string;

  constructor(data: unknown) {
    const parsed = resumePTPlanSchema.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((err) => err.message).join(', ');
      throw new Error(errors);
    }
    this.planId = parsed.data.planId;
  }
}