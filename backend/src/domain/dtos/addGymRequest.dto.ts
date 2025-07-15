export interface AddGymRequestDTO {
  name: string;
  type: 'Premium' | 'Basic' | 'Diamond';
  description: string | null;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    lat: string;
    lng: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  facilities: string[];
  equipment?: Array<{
    type: string;
    category: string;
    quantity: number;
    condition: string;
  }>;
  schedule: Array<{
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    isClosed: boolean;
    slotDuration: number;
    slotCapacity: number;
  }>;
  maxCapacity: number;
  trainers?: Array<{
    trainerId: string;
    active: boolean;
  }>;
}

export interface IGymCreateInputDTO {
  id?: string;
  name: string;
  type: string;
  description?: string | null;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  } | null;
  location?: {
    lat: number;
    lng: number;
  } | null;
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  } | null;
  equipment?: Array<{
    name: string;
    quantity: number;
  }>;
  schedule?: Array<{
    day: string;
    openTime: string;
    closeTime: string;
  }>;
  trainers?: Array<{
    name: string;
    specialty: string;
  }>;
  suggestedPlan?: string | null;
  facilities?: {
    parking?: boolean;
    showers?: boolean;
    lockers?: boolean;
  } | null;
  maxCapacity: number;
  membershipCompatibility?: string[];
  images?: Array<{
    url: string;
    alt?: string;
  }>;
  ratings?: {
    average: number;
    count: number;
  } | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}