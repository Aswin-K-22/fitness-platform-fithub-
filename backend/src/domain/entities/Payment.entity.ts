import { PaymentErrorType } from '../enums/paymentErrorType.enum';
import crypto from 'crypto';

interface PaymentProps {
  id?: string;
  type: string;
  userId?: string;
  amount: number;
  currency: string;
  paymentGateway?: string;
  paymentId?: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Payment {
  private _id: string;
  private _type: string;
  private _userId?: string;
  private _amount: number;
  private _currency: string;
  private _paymentGateway?: string;
  private _paymentId?: string;
  private _status: string;
  private _createdAt: Date;
  private _updatedAt: Date;

  static create(props: PaymentProps): Payment {
    if (!props.type || !props.amount || !props.currency || !props.status) {
      throw new Error(PaymentErrorType.MissingRequiredFields);
    }
    if (props.amount <= 0) {
      throw new Error(PaymentErrorType.InvalidAmount);
    }
    if (!['Pending', 'Paid', 'Failed'].includes(props.status)) {
      throw new Error(PaymentErrorType.InvalidStatus);
    }
    return new Payment(props);
  }

  get id(): string {
    return this._id;
  }

  get type(): string {
    return this._type;
  }

  get userId(): string | undefined {
    return this._userId;
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): string {
    return this._currency;
  }

  get paymentGateway(): string | undefined {
    return this._paymentGateway;
  }

  get paymentId(): string | undefined {
    return this._paymentId;
  }

  get status(): string {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  updateStatus(status: string, paymentId: string): void {
    if (!['Paid', 'Failed'].includes(status)) {
      throw new Error(PaymentErrorType.InvalidStatus);
    }
    this._status = status;
    this._paymentId = paymentId;
    this._updatedAt = new Date();
  }

  private constructor(props: PaymentProps) {
    this._id = props.id || crypto.randomUUID();
    this._type = props.type;
    this._userId = props.userId;
    this._amount = props.amount;
    this._currency = props.currency;
    this._paymentGateway = props.paymentGateway;
    this._paymentId = props.paymentId;
    this._status = props.status;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }
}