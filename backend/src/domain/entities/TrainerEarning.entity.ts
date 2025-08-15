import { ERRORMESSAGES } from '../constants/errorMessages.constant';

export enum EarningType {
  FixedSalary = "FixedSalary",
  PTCommission = "PTCommission",
}

interface TrainerEarningProps {
  id?: string;
  trainerId: string;
  userId?: string | null;
  ptPlanPurchaseId?: string | null;
  periodStart: Date;
  periodEnd: Date;
  amount: number;
  type: EarningType;
  isCredited?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class TrainerEarning {
  private _id?: string;
  private _trainerId: string;
  private _userId?: string | null;
  private _ptPlanPurchaseId?: string | null;
  private _periodStart: Date;
  private _periodEnd: Date;
  private _amount: number;
  private _type: EarningType;
  private _isCredited: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: TrainerEarningProps) {
    if (!props.trainerId || !props.periodStart || !props.periodEnd || !props.amount || !props.type) {
      throw new Error(JSON.stringify(ERRORMESSAGES.GENERIC_ERROR));
    }
    this._id = props.id;
    this._trainerId = props.trainerId;
    this._userId = props.userId ?? null;
    this._ptPlanPurchaseId = props.ptPlanPurchaseId ?? null;
    this._periodStart = props.periodStart;
    this._periodEnd = props.periodEnd;
    this._amount = props.amount;
    this._type = props.type;
    this._isCredited = props.isCredited ?? false;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get id(): string | null {
    return this._id ?? null;
  }

  get trainerId(): string {
    return this._trainerId;
  }

  get userId(): string | null | undefined {
    return this._userId;
  }

  get ptPlanPurchaseId(): string | null | undefined {
    return this._ptPlanPurchaseId;
  }

  get periodStart(): Date {
    return this._periodStart;
  }

  get periodEnd(): Date {
    return this._periodEnd;
  }

  get amount(): number {
    return this._amount;
  }

  get type(): EarningType {
    return this._type;
  }

  get isCredited(): boolean {
    return this._isCredited;
  }

  toJSON(): any {
    return {
      id: this._id,
      trainerId: this._trainerId,
      userId: this._userId,
      ptPlanPurchaseId: this._ptPlanPurchaseId,
      periodStart: this._periodStart.toISOString(),
      periodEnd: this._periodEnd.toISOString(),
      amount: this._amount,
      type: this._type,
      isCredited: this._isCredited,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
