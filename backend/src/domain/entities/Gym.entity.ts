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

interface Contact {
  phone?: string | null;
  email?: string | null;
  website?: string | null;
}

interface Equipment {
  type: string;
  category: string;
  quantity: number;
  condition: string;
}

interface Schedule {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isClosed: boolean;
}

interface Trainer {
  trainerId: string;
  active: boolean;
}

interface Facilities {
  hasPool?: boolean | null;
  hasSauna?: boolean | null;
  hasParking?: boolean | null;
  hasLockerRooms?: boolean | null;
  hasWifi?: boolean | null;
  hasShowers?: boolean | null;
}

interface GymProps {
  id?: string;
  name: string;
  type?: string | null;
  description?: string | null;
  maxCapacity?: number;
  membershipCompatibility?: string[];
  address?: GymAddress | null;
  contact?: Contact | null;
  equipment?: Equipment[];
  schedule?: Schedule[];
  trainers?: Trainer[];
  facilities?: Facilities | null;
  location?: { type: string; coordinates: [number, number] } | null;
  images?: GymImage[] | null;
  ratings?: Ratings | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export class Gym {
  private _id?: string;
  private _name: string;
  private _type: string | null;
  private _description: string | null;
  private _maxCapacity?: number;
  private _membershipCompatibility?: string[];
  private _address: GymAddress | null;
  private _contact: Contact | null;
  private _equipment: Equipment[];
  private _schedule: Schedule[];
  private _trainers: Trainer[];
  private _facilities: Facilities | null;
  private _location: { type: string; coordinates: [number, number] } | null;
  private _images: GymImage[] | null;
  private _ratings: Ratings | null;
  private _createdAt: Date | string;
  private _updatedAt: Date | string;

  constructor(props: GymProps) {
    if (!props.name) {
      throw new Error(GymErrorType.MissingRequiredFields);
    }
    this._id = props.id;
    this._name = props.name;
    this._type = props.type ?? null;
    this._description = props.description ?? null;
    this._maxCapacity = props.maxCapacity;
    this._membershipCompatibility = props.membershipCompatibility ?? [];
    this._address = props.address ?? null;
    this._contact = props.contact ?? null;
    this._equipment = props.equipment ?? [];
    this._schedule = props.schedule ?? [];
    this._trainers = props.trainers ?? [];
    this._facilities = props.facilities ?? null;
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

  get maxCapacity(): number | undefined {
    return this._maxCapacity;
  }

  get membershipCompatibility(): string[] {
    return this._membershipCompatibility || [];
  }

  get address(): GymAddress | null {
    return this._address;
  }

  get contact(): Contact | null {
    return this._contact;
  }

  get equipment(): Equipment[] {
    return this._equipment;
  }

  get schedule(): Schedule[] {
    return this._schedule;
  }

  get trainers(): Trainer[] {
    return this._trainers;
  }

  get facilities(): Facilities | null {
    return this._facilities;
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

  get createdAt(): Date | string {
    return this._createdAt;
  }

  get updatedAt(): Date | string {
    return this._updatedAt;
  }
}