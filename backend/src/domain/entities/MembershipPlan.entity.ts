import { MembershipErrorType } from '../enums/membershipErrorType.enum';

interface MembershipProps {
  id?: string;
  name: string; 
  description: string | null ;
  price: number;
  duration: number;
  features: string[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export class MembershipPlan {
  private _id?: string;
  private _name: string;
 private _description:string | null ;
  private _price: number;
  private _duration: number;
  private _features: string[];
  private _createdAt: Date | string;
  private _updatedAt: Date | string;

  constructor(props: MembershipProps) {
    if (!props.name || !props.description || props.price == null || props.duration == null) {
      throw new Error(MembershipErrorType.MissingRequiredFields);
    }
    this._id = props.id;
    this._name = props.name;
    this._description = props.description || '' ;
    this._price = props.price;
    this._duration = props.duration;
    this._features = props.features || [];
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // Getters
  get id(): string | undefined {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description():string | null   {
    return this._description;
  }

  get price(): number {
    return this._price;
  }

  get duration(): number {
    return this._duration;
  }

  get features(): string[] {
    return this._features;
  }

  get createdAt(): Date | string {
    return this._createdAt;
  }

  get updatedAt(): Date | string {
    return this._updatedAt;
  }
}