export interface MembershipPlan {
    id: string;
    name: "Premium" | "Basic" | "Diamond";
    description: string;
    price: number;
    duration: number; // In months
    features: string[];
    createdAt: string;
    updatedAt: string;
  }