import { PTPlanCategory } from '../enums/PTPlanCategory';

export interface PTPlanFilter {
  isActive?: boolean;
  verifiedByAdmin?: boolean;
  category?: PTPlanCategory | { equals: PTPlanCategory };
  totalPrice?: {
    gte?: number;
    lte?: number;
  };
}