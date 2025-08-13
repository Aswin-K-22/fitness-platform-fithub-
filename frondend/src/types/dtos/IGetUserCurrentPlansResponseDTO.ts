export interface MembershipDTO {
  id?: string;
  userId: string;
  planId: string;
  status: string;
  startDate: string; // ISO string
  endDate: string;
  paymentId: string | null;
  price: number | null;
  currency: string | null;
  paymentStatus: string | null;
  paymentDate: string | null;
  createdAt: string;
  updatedAt: string;
}