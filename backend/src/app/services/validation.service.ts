import { z, ZodError } from 'zod';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';

export interface IValidationService {
  validate<T>(schema: z.ZodSchema<T>, data: any): Promise<{ success: boolean; data?: T; error?: any }>;
}

export class ValidationService implements IValidationService {
  async validate<T>(schema: z.ZodSchema<T>, data: any): Promise<{ success: boolean; data?: T; error?: any }> {
    try {
      const parsedData = await schema.parseAsync(data);
      return { success: true, data: parsedData };
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: this.mapZodErrorToCode(err.message),
        }));
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: formattedErrors,
          },
        };
      }
      return {
        success: false,
        error: {
          code: ERRORMESSAGES.GENERIC_ERROR.code,
          message: ERRORMESSAGES.GENERIC_ERROR.message,
        },
      };
    }
  }

  private mapZodErrorToCode(message: string): string {
    for (const category in ERRORMESSAGES) {
      for (const errorType in ERRORMESSAGES[category]) {
        if (ERRORMESSAGES[category][errorType].message === message) {
          return ERRORMESSAGES[category][errorType].code;
        }
      }
    }
    return 'VALIDATION_ERROR';
  }
}