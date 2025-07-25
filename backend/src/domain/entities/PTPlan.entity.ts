// src/domain/entities/PTPlan.entity.ts

import { IPTPlanRequestToEntity} from '../dtos/createPTPlanRequest.dto'; // DTO for creating PTPlan
import { ERRORMESSAGES } from '../constants/errorMessages.constant';

// Interface for PTPlan properties based on Prisma schema
interface PTPlanProps {
  id?: string;
  title: string;
  category: 'beginner' | 'intermediate' | 'advanced';
  mode: 'online';
  description: string;
  goal: string;
  features: string[];
  duration: number;
  image: string | null;
  trainerPrice: number;
  adminPrice: number | null;
  totalPrice: number | null;
  verifiedByAdmin: boolean ;
  createdBy: string; // Trainer ID
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
  

}

export class PTPlan {
  private _id?: string;
  private _title: string;
  private _category:'beginner' | 'intermediate' | 'advanced';
  private _mode: 'online';
  private _description: string;
  private _goal: string;
  private _features: string[];
  private _duration: number;
  private _image: string | null;
  private _trainerPrice: number;
  private _adminPrice: number | null;
  private _totalPrice: number | null;
  private _verifiedByAdmin: boolean;
  private _createdBy: string;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _isActive: boolean;

  static create(dto: IPTPlanRequestToEntity): PTPlan {

 if (!dto.title || !dto.category || !dto.mode || !dto.description || !dto.goal || !dto.features || !dto.duration || !dto.trainerPrice || !dto.createdBy) {
      throw new Error(JSON.stringify(ERRORMESSAGES.GYM_MISSING_REQUIRED_FIELDS));
    }

    // Validate category
    const validCategories = ['beginner', 'intermediate', 'advanced'] as const;
    if (!validCategories.includes(dto.category)) {
      throw new Error(JSON.stringify(ERRORMESSAGES.PTPLAN_INVALID_CATEGORY));
    }

    // Validate mode
    if (dto.mode !== 'online') {
      throw new Error(JSON.stringify(ERRORMESSAGES.PTPLAN_INVALID_MODE));
    }

    // Validate duration and trainerPrice
    if (dto.duration <= 0) {
      throw new Error(JSON.stringify(ERRORMESSAGES.PTPLAN_INVALID_DURATION));
    }
    if (dto.trainerPrice <= 0) {
      throw new Error(JSON.stringify(ERRORMESSAGES.PTPLAN_INVALID_TRAINER_PRICE));
    }

    // Validate features array
    if (!Array.isArray(dto.features) || dto.features.length === 0) {
      throw new Error(JSON.stringify(ERRORMESSAGES.PTPLAN_INVALID_FEATURES));
    }

    try {
      return new PTPlan({
        title: dto.title,
        category: dto.category,
        mode: dto.mode,
        description: dto.description,
        goal: dto.goal,
        features: dto.features,
        duration: dto.duration,
        image: dto.image ?? null,
        trainerPrice: dto.trainerPrice,
        adminPrice: dto.adminPrice ?? null,
        totalPrice: dto.totalPrice ?? (dto.trainerPrice + (dto.adminPrice ?? 0)),
        verifiedByAdmin: false,
        createdBy: dto.createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      });
    } catch (error) {
      throw new Error(JSON.stringify(ERRORMESSAGES.GENERIC_ERROR));
    }
}

   
  

  // Getters
  get id(): string | null {
    return this._id || null;
  }

  get title(): string {
    return this._title;
  }

  get category(): 'beginner' | 'intermediate' | 'advanced' {
    return this._category;
  }

  get mode(): 'online' {
    return this._mode;
  }

  get description(): string {
    return this._description;
  }

  get goal(): string {
    return this._goal;
  }



  get features(): string[] {
    return this._features;
  }

  get duration(): number {
    return this._duration;
  }

  get image(): string | null {
    return this._image;
  }

  get trainerPrice(): number {
    return this._trainerPrice;
  }

  get adminPrice(): number | null {
    return this._adminPrice;
  }

  get totalPrice(): number | null {
    return this._totalPrice;
  }

  get verifiedByAdmin(): boolean {
    return this._verifiedByAdmin;
  }

  get createdBy(): string {
    return this._createdBy;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
get isActive(): boolean {
    return this._isActive;
  }


  constructor(props: PTPlanProps) {
    this._id = props.id;
    this._title = props.title;
    this._category = props.category;
    this._mode = props.mode;
    this._description = props.description;
    this._goal = props.goal;
    this._features = props.features;
    this._duration = props.duration;
    this._image = props.image ?? null;
    this._trainerPrice = props.trainerPrice;
    this._adminPrice = props.adminPrice ?? 0;
    this._totalPrice = props.totalPrice ?? ((props.trainerPrice || 0) + (props.adminPrice || 0));
    this._verifiedByAdmin = props.verifiedByAdmin ?? false;
    this._createdBy = props.createdBy;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
    this._isActive = props.isActive ?? true;

  }

  toJSON(): any {
    return {
      id: this._id,
      title: this._title,
      category: this._category,
      mode: this._mode,
      description: this._description,
      goal: this._goal,
      features: this._features,
      duration: this._duration,
      image: this._image,
      trainerPrice: this._trainerPrice,
      adminPrice: this._adminPrice,
      totalPrice: this._totalPrice,
      verifiedByAdmin: this._verifiedByAdmin,
      createdBy: this._createdBy,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      isActive: this._isActive,
    };
  }
}