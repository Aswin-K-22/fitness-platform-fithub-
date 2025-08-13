import { z } from 'zod';
import { ERRORMESSAGES } from '../constants/errorMessages.constant';
import { PTPlanCategory } from '../enums/PTPlanCategory';

export interface IEditPTPlanRequestDTO {
  title?: string;
 category?: PTPlanCategory;
  mode?: 'online';
  description?: string;
  goal?: string;
  features?: string[];
  duration?: number;
  image?: Express.Multer.File; // Multer file for incoming image
  trainerPrice?: number;
}

export interface IEditPTPlanRequestToEntity {
  title?: string;
 category?: PTPlanCategory;
  mode?: 'online';
  description?: string;
  goal?: string;
  features?: string[];
  duration?: number;
  image?: string | null; // S3 key or null
  trainerPrice?: number;
}

export const editPTPlanSchema = z.object({
  title: z
    .string()
    .min(5, { message: ERRORMESSAGES.PTPLAN_MISSING_REQUIRED_FIELDS.message })
    .max(100, { message: 'Title cannot exceed 100 characters' })
    .nonempty({ message: ERRORMESSAGES.PTPLAN_MISSING_REQUIRED_FIELDS.message })
    .trim()
    .optional(),
 category: z
    .nativeEnum(PTPlanCategory, {
      errorMap: () => ({ message: ERRORMESSAGES.PTPLAN_INVALID_CATEGORY.message }),
    })
    .optional(),
  mode: z
    .literal('online', {
      errorMap: () => ({ message: ERRORMESSAGES.PTPLAN_INVALID_MODE.message }),
    })
    .optional(),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters long' })
    .max(1000, { message: 'Description cannot exceed 1000 characters' })
    .nonempty({ message: ERRORMESSAGES.PTPLAN_MISSING_REQUIRED_FIELDS.message })
    .trim()
    .optional(),
  goal: z
    .string()
    .min(5, { message: 'Goal must be at least 5 characters long' })
    .max(100, { message: 'Goal cannot exceed 100 characters' })
    .nonempty({ message: ERRORMESSAGES.PTPLAN_MISSING_REQUIRED_FIELDS.message })
    .trim()
    .optional(),
  features: z
    .string()
    .transform((val) => {
      try {
        return JSON.parse(val);
      } catch {
        throw new Error(ERRORMESSAGES.PTPLAN_INVALID_FEATURES.message);
      }
    })
    .refine(
      (val) => Array.isArray(val) && val.length > 0 && val.every((item) => typeof item === 'string'),
      { message: ERRORMESSAGES.PTPLAN_INVALID_FEATURES.message }
    )
    .optional(),
  duration: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1 && val <= 12, { message: ERRORMESSAGES.PTPLAN_INVALID_DURATION.message })
    .optional(),
  trainerPrice: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => val >= 0 && val <= 100000, { message: ERRORMESSAGES.PTPLAN_INVALID_TRAINER_PRICE.message })
    .optional(),
});

export class EditPTPlanRequestDTO implements IEditPTPlanRequestDTO {
  public title?: string;
  public category?: PTPlanCategory;
  public mode?: 'online';
  public description?: string;
  public goal?: string;
  public features?: string[];
  public duration?: number;
  public trainerPrice?: number;

  constructor(data: unknown) {
    const parsed = editPTPlanSchema.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((err) => err.message).join(', ');
      throw new Error(errors);
    }
    this.title = parsed.data.title;
    this.category = parsed.data.category;
    this.mode = parsed.data.mode;
    this.description = parsed.data.description;
    this.goal = parsed.data.goal;
    this.features = parsed.data.features;
    this.duration = parsed.data.duration;
    this.trainerPrice = parsed.data.trainerPrice;
  }

  toEntity(): IEditPTPlanRequestToEntity {
    return {
      title: this.title,
      category: this.category,
      mode: this.mode,
      description: this.description,
      goal: this.goal,
      features: this.features,
      duration: this.duration,
      trainerPrice: this.trainerPrice,
      image: null, // Image is handled in the use case
    };
  }
}