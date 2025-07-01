import { Membership } from '@/domain/entities/Membership.entity';

export interface IMembershipsRepository {
    createMembership(data: {
    userId: string;
    planId: string;
    status: string;
    startDate: Date;
    endDate: Date;
    paymentId: string;
    price: number;
    currency: string;
    paymentStatus: string;
    paymentDate: Date;
  }): Promise<Membership>;
}