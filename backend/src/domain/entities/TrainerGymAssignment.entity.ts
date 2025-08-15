import { ERRORMESSAGES } from '../constants/errorMessages.constant';

interface TrainerGymAssignmentProps {
  id?: string;
  trainerId: string;
  gymId: string;
  dayRate?: number;
  assignedAt: Date;
  unassignedAt?: Date | null;
  salaryPaidUntil?: Date;
}

export class TrainerGymAssignment {
  private _id?: string;
  private _trainerId: string;
  private _gymId: string;
  private _dayRate: number;
  private _assignedAt: Date;
  private _unassignedAt?: Date | null;
  private _salaryPaidUntil: Date;

  constructor(props: TrainerGymAssignmentProps) {
    if (!props.trainerId || !props.gymId || !props.assignedAt) {
      throw new Error(JSON.stringify(ERRORMESSAGES.GENERIC_ERROR));
    }
    this._id = props.id;
    this._trainerId = props.trainerId;
    this._gymId = props.gymId;
    this._dayRate = props.dayRate ?? 100;
    this._assignedAt = props.assignedAt;
    this._unassignedAt = props.unassignedAt ?? null;
    this._salaryPaidUntil = props.salaryPaidUntil ?? props.assignedAt;
  }

  get id(): string | null {
    return this._id ?? null;
  }

  get trainerId(): string {
    return this._trainerId;
  }

  get gymId(): string {
    return this._gymId;
  }

  get dayRate(): number {
    return this._dayRate;
  }

  get assignedAt(): Date {
    return this._assignedAt;
  }

  get unassignedAt(): Date | null | undefined {
    return this._unassignedAt;
  }

  get salaryPaidUntil(): Date {
    return this._salaryPaidUntil;
  }

  toJSON(): any {
    return {
      id: this._id,
      trainerId: this._trainerId,
      gymId: this._gymId,
      dayRate: this._dayRate,
      assignedAt: this._assignedAt.toISOString(),
      unassignedAt: this._unassignedAt ? this._unassignedAt.toISOString() : null,
      salaryPaidUntil: this._salaryPaidUntil.toISOString(),
    };
  }
}
