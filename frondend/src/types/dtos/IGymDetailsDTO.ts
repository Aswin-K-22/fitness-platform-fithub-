// src/domain/dtos/user/IGymDetailsDTO.ts
export interface IGymDetailsDTO {
    id: string;
    name: string;
    type: string;
    description: string | null;
    maxCapacity: number;
    membershipCompatibility: string[];
    address: {
      street: string | null;
      city: string | null;
      state: string | null;
      postalCode: string | null;
      lat: number | null;
      lng: number | null;
    };
    contact: {
      phone: string | null;
      email: string | null;
      website: string | null;
    };
    equipment: { type: string; category: string; quantity: number; condition: string }[];
    schedule: { dayOfWeek: string; startTime: string; endTime: string; isClosed: boolean }[];
    trainers: { trainerId: string; active: boolean }[];
    facilities: {
      hasPool: boolean | null;
      hasSauna: boolean | null;
      hasParking: boolean | null;
      hasLockerRooms: boolean | null;
      hasWifi: boolean | null;
      hasShowers: boolean | null;
    };
    images: { url: string; uploadedAt: string }[];
    ratings?: { average?: number; count?: number };
    createdAt: string | undefined;
    updatedAt: string | undefined;
  }