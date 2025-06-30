export interface IMembershipOutRequestDTO {
  id: string;
  userId: string;
  planId: string;
  status: string;
  startDate: Date;
  endDate: Date;
  price?: number;
  currency?: string;
  paymentStatus?: string;
}