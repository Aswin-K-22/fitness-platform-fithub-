// src/domain/entities/PTPlanPurchase.entity.ts

import { ERRORMESSAGES } from '../constants/errorMessages.constant';
import { PTPlanPurchaseStatus } from '../enums/PTPlanPurchaseStatus';


interface PTPlanPurchaseProps {
  id?: string;
  userId: string;
  ptPlanId: string;
  status: PTPlanPurchaseStatus;
  startDate: Date;
  endDate: Date;
  paymentId?: string | null;
  price?: number | null;
  currency?: string; // default 'INR'
  paymentStatus?: string | null;
  paymentDate?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PTPlanPurchase {
  private _id?: string;
  private _userId: string;
  private _ptPlanId: string;
  private _status: PTPlanPurchaseStatus;
  private _startDate: Date;
  private _endDate: Date;
  private _paymentId?: string | null;
  private _price?: number | null;
  private _currency: string;
  private _paymentStatus?: string | null;
  private _paymentDate?: Date | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: PTPlanPurchaseProps) {
    if (!props.userId || !props.ptPlanId || !props.status || !props.startDate || !props.endDate) {
      throw new Error(JSON.stringify(ERRORMESSAGES.GENERIC_ERROR));
    }
    this._id = props.id;
    this._userId = props.userId;
    this._ptPlanId = props.ptPlanId;
    this._status = props.status;
    this._startDate = props.startDate;
    this._endDate = props.endDate;
    this._paymentId = props.paymentId ?? null;
    this._price = props.price ?? null;
    this._currency = props.currency ?? 'INR';
    this._paymentStatus = props.paymentStatus ?? null;
    this._paymentDate = props.paymentDate ?? null;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get id(): string | null {
    return this._id ?? null;
  }

  get userId(): string {
    return this._userId;
  }

  get ptPlanId(): string {
    return this._ptPlanId;
  }

  get status(): PTPlanPurchaseStatus {
    return this._status;
  }

  get startDate(): Date {
    return this._startDate;
  }

  get endDate(): Date {
    return this._endDate;
  }

  get paymentId(): string | null | undefined {
    return this._paymentId;
  }

  get price(): number | null | undefined {
    return this._price;
  }

  get currency(): string {
    return this._currency;
  }

  get paymentStatus(): string | null | undefined {
    return this._paymentStatus;
  }

  get paymentDate(): Date | null | undefined {
    return this._paymentDate;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  toJSON(): any {
    return {
      id: this._id,
      userId: this._userId,
      ptPlanId: this._ptPlanId,
      status: this._status,
      startDate: this._startDate.toISOString(),
      endDate: this._endDate.toISOString(),
      paymentId: this._paymentId,
      price: this._price,
      currency: this._currency,
      paymentStatus: this._paymentStatus,
      paymentDate: this._paymentDate ? this._paymentDate.toISOString() : null,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
