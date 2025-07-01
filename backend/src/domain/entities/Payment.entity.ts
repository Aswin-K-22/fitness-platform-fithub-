import { PaymentErrorType } from '../enums/paymentErrorType.enum';

interface PaymentProps {
  id?: string;
  type: string;
  userId : string | null;
  membershipId?: string;
  amount: number;
  currency: string;
  paymentGateway: string | null;
  paymentId: string | null;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Payment {
  private _id?: string;
  private _type: string;
  private _userId: string |null;
  private _membershipId?: string;
  private _amount: number;
  private _currency: string;
  private _paymentGateway: string | null;
  private _paymentId: string | null;
  private _status: string;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: PaymentProps) {
    if (!props.type || !props.amount || !props.currency || !props.status) {
      throw new Error(PaymentErrorType.MissingRequiredFields);
    }
    this._id = props.id;
    this._type = props.type;
    this._userId = props.userId;
    this._membershipId = props.membershipId;
    this._amount = props.amount;
    this._currency = props.currency;
    this._paymentGateway = props.paymentGateway;
    this._paymentId = props.paymentId;
    this._status = props.status;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // Getters
  get id(): string | undefined { return this._id; }
  get type(): string { return this._type; }
  get userId(): string | null { return this._userId; }
  get membershipId(): string | undefined { return this._membershipId; }
  get amount(): number { return this._amount; }
  get currency(): string { return this._currency; }
  get paymentGateway(): string | null{ return this._paymentGateway; }
  get paymentId(): string |null { return this._paymentId; }
  get status(): string { return this._status; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
}