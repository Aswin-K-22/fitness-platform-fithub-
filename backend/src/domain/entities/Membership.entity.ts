import { MembershipErrorType } from '../enums/membershipErrorType.enum';

interface MembershipProps {
  id?: string;
  userId: string;
  planId: string;
  status: string;
  startDate: Date;
  endDate: Date;
  paymentId:string | null;
  price: number | null;
  currency: string | null;
  paymentStatus: string | null;
  paymentDate: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Membership {
  private _id?: string;
  private _userId: string;
  private _planId: string;
  private _status: string;
  private _startDate: Date;
  private _endDate: Date;
  private _paymentId: string | null;
  private _price: number | null;
  private _currency: string | null;
  private _paymentStatus : string | null;
  private _paymentDate: Date | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: MembershipProps) {
    if (!props.userId || !props.planId || !props.status || !props.startDate || !props.endDate) {
      throw new Error(MembershipErrorType.MissingRequiredFields);
    }
    this._id = props.id;
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

  // Getters
  get id(): string | undefined { return this._id; }
  get userId(): string { return this._userId; }
  get planId(): string { return this._planId; }
  get status(): string { return this._status; }
  get startDate(): Date { return this._startDate; }
  get endDate(): Date { return this._endDate; }
  get paymentId(): string | null { return this._paymentId; }
  get price(): number | null { return this._price; }
  get currency(): string | null  { return this._currency; }
  get paymentStatus(): string | null { return this._paymentStatus; }
  get paymentDate(): Date | null { return this._paymentDate; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

toJSON(): any {
    return {
      id: this._id,
      userId: this._userId,
      planId: this._planId,
      status: this._status,
      startDate: this._startDate,
      endDate: this._endDate,
      paymentId: this._paymentId,
      price: this._price,
      currency: this._currency,
      paymentStatus: this._paymentStatus,
      paymentDate: this._paymentDate,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}