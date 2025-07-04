// src/types/membership.types.ts
export interface MembershipPlan {
  id: string;
  name: string;
  type: 'Basic' | 'Premium' | 'Diamond';
  description: string | null;
  price: number;
  duration: number;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

