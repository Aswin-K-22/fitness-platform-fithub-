export interface ICreateMembershipRequestDTO {
  userId: string;
  planId: string;
  status: string;
  startDate: Date;
  endDate: Date;
  paymentId?: string;
  price?: number;
  currency?: string;
  paymentStatus?: string;
  paymentDate?: Date;
}