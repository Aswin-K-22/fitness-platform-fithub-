import { MembershipErrorType } from '../enums/membershipErrorType.enum';

interface MembershipProps {
  id?: string;
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
  createdAt?: Date;
  updatedAt?: Date;
}

export class Membership {
  private _id: string;
  private _userId: string;
  private _planId: string;
  private _status: string;
  private _startDate: Date;
  private _endDate: Date;
  private _paymentId?: string;
  private _price?: number;
  private _currency?: string;
  private _paymentStatus?: string;
  private _paymentDate?: Date;
  private _createdAt: Date;
  private _updatedAt: Date;

  static create(props: MembershipProps): Membership {
    if (!props.userId || !props.planId || !props.status || !props.startDate || !props.endDate) {
      throw new Error(MembershipErrorType.MissingRequiredFields);
    }
    if (!['Active', 'Expired', 'Pending'].includes(props.status)) {
      throw new Error(MembershipErrorType.InvalidStatus);
    }
    if (props.startDate >= props.endDate) {
      throw new Error(MembershipErrorType.InvalidDateRange);
    }
    return new Membership(props);
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get planId(): string {
    return this._planId;
  }

  get status(): string {
    return this._status;
  }

  get startDate(): Date {
    return this._startDate;
  }

  get endDate(): Date {
    return this._endDate;
  }

  get paymentId(): string | undefined {
    return this._paymentId;
  }

  get price(): number | undefined {
    return this._price;
  }

  get currency(): string | undefined {
    return this._currency;
  }

  get paymentStatus(): string | undefined {
    return this._paymentStatus;
  }

  get paymentDate(): Date | undefined {
    return this._paymentDate;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  activate(paymentId: string, paymentStatus: string, paymentDate: Date): void {
    if (this._status === 'Active') {
      throw new Error(MembershipErrorType.AlreadyActive);
    }
    this._paymentId = paymentId;
    this._paymentStatus = paymentStatus;
    this._paymentDate = paymentDate;
    this._status = 'Active';
    this._updatedAt = new Date();
  }

  private constructor(props: MembershipProps) {
    this._id = props.id || crypto.randomUUID();
    this._userId = props.userId;
    this._planId = props.planId;
    this._status = props.status;
    this._startDate = props.startDate;
    this._endDate = props.endDate;
    this._paymentId = props.paymentId;
    this._price = props.price;
    this._currency = props.currency;
    this._paymentStatus = props.paymentStatus;
    this._paymentDate = props.paymentDate;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }
}