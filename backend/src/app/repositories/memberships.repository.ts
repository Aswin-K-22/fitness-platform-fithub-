// backend/src/app/repositories/memberships.repository.ts
import { IBaseRepository } from './base.repository';
import { Membership } from '@/domain/entities/Membership.entity';

export interface IMembershipsRepository extends IBaseRepository<Membership> {}