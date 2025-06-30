// backend/src/domain/entities/Gym.entity.ts

import { GymErrorType } from "../enums/gymErrorType.enums";


interface GymAddress {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  lat?: number | null;
  lng?: number | null;
}

interface Ratings {
  average?: number | null;
  count?: number | null;
  reviews?: Review[];
}

interface Review {
  userId: string;
  rating: number;
  comment?: string | null;
  date: Date;
}

interface GymImage {
  url: string;
  description?: string | null;
  uploadedAt: Date;
}

interface GymProps {
  id?: string;
  name: string;
  type?: string | null;
  description?: string | null;
  address?: GymAddress | null;
  location?: { type: string; coordinates: [number, number] } | null;
  images?: GymImage[] | null;
  ratings?: Ratings | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Gym {
  private _id?: string;
  private _name: string;
  private _type: string | null;
  private _description: string | null;
  private _address: GymAddress | null;
  private _location: { type: string; coordinates: [number, number] } | null;
  private _images: GymImage[] | null;
  private _ratings: Ratings | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: GymProps) {
    if (!props.name) {
      throw new Error(GymErrorType.MissingRequiredFields);
    }
    this._id = props.id;
    this._name = props.name;
    this._type = props.type ?? null;
    this._description = props.description ?? null;
    this._address = props.address ?? null;
    this._location = props.location ?? null;
    this._images = props.images ?? null;
    this._ratings = props.ratings ?? null;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // Getters
  get id(): string | null {
    return this._id || null;
  }

  get name(): string {
    return this._name;
  }

  get type(): string | null {
    return this._type;
  }

  get description(): string | null {
    return this._description;
  }

  get address(): GymAddress | null {
    return this._address;
  }

  get location(): { type: string; coordinates: [number, number] } | null {
    return this._location;
  }

  get images(): GymImage[] | null {
    return this._images;
  }

  get ratings(): Ratings | null {
    return this._ratings;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}