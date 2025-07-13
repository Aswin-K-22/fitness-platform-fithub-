export interface GymDetailsDTO {
  id: string;
  name: string;
  type: string | undefined;
  description: string | null;
  maxCapacity: number | undefined;
  membershipCompatibility: string[];
  address: {
    street: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    lat: number | null;
    lng: number | null;
  } | undefined;
  contact: {
    phone: string | null;
    email: string | null;
    website: string | null;
  } | undefined;
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
  } | undefined;
  images: { url: string; uploadedAt: string }[];
  ratings: { average?: number; count?: number } | undefined;
  createdAt: string | undefined;
  updatedAt: string | undefined;
}

export interface IGetGymDetailsResponseDTO {
  success: boolean;
  status: number;
  message?: string;
  data?: { gym: GymDetailsDTO };
  error?: { code: string; message: string };
}