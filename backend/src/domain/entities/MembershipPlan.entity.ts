// src/domain/entities/MembershipPlan.entity.ts
import { MembershipErrorType } from '../enums/membershipErrorType.enum';

interface MembershipProps {
  id?: string;
  name: string;
  type: 'Basic' | 'Premium' | 'Diamond';
  description: string ;
  price: number;
  duration: number;
  features: string[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export class MembershipPlan {
  public id?: string;
  public name: string;
  public type: 'Basic' | 'Premium' | 'Diamond';
  public description: string ;
  public price: number;
  public duration: number;
  public features: string[];
  public createdAt: Date | string;
  public updatedAt: Date | string;

  constructor(props: MembershipProps) {
    if (!props.name || !props.type || props.price == null || props.duration == null) {
      throw new Error(MembershipErrorType.MissingRequiredFields);
    }
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.description = props.description;
    this.price = props.price;
    this.duration = props.duration;
    this.features = props.features || [];
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}