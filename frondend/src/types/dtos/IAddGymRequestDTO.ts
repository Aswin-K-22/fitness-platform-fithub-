// src/domain/dtos/admin/IAddGymRequestDTO.ts
export interface IAddGymRequestDTO {
    name: string;
    type: "Premium" | "Basic" | "Diamond";
    description: string;
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
    facilities?: string[];
    equipment: {
      type: string;
      category: string;
      quantity: number;
      condition: string;
    }[];
    schedule: {
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      isClosed: boolean;
      slotDuration: number;
      slotCapacity: number;
    }[];
    maxCapacity: number;
    trainers: {
      trainerId: string;
      active: boolean;
    }[];
    images: File[]; 
  }