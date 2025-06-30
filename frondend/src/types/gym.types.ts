export interface Gym {
  id: string;
  name: string;
  type: string;
  description?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    lat?: number;
    lng?: number;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  equipment?: {
    type: string;
    category: string;
    quantity: number;
    condition: string;
  }[];
  schedule?: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    isClosed: boolean;
    slotDuration: number;
    slotCapacity: number;
  }[];
  trainers?: {
    trainerId: string;
    active: boolean;
  }[];
  facilities?: {
    hasPool: boolean;
    hasSauna: boolean;
    hasParking: boolean;
    hasLockerRooms: boolean;
    hasWifi: boolean;
    hasShowers: boolean;
  };
  images: {
    url: string;
    description?: string;
    uploadedAt: Date;
  }[];
  ratings?: {
    average?: number;
    count?: number;
    reviews?: {
      userId: string;
      rating: number;
      comment?: string;
      date: Date;
    }[];
  };
  maxCapacity: number;
  membershipCompatibility: string[];
  createdAt: Date;
  updatedAt: Date;
}
