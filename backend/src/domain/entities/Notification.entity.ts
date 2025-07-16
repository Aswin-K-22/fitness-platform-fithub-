export interface NotificationProps {
  id?: string;
  userId: string;
  message: string;
  type: 'success' | 'error' | 'info';
  createdAt?: Date;
  read?: boolean;
}

export class Notification {
  private _id?: string;
  private _userId: string;
  private _message: string;
  private _type: 'success' | 'error' | 'info';
  private _createdAt: Date;
  private _read: boolean;

  constructor(props: NotificationProps) {
    if (!props.userId || !props.message || !props.type) {
      throw new Error('Missing required fields: userId, message, or type');
    }
    if (!['success', 'error', 'info'].includes(props.type)) {
      throw new Error('Invalid notification type');
    }
    this._id = props.id; // Let Prisma generate ID if not provided
    this._userId = props.userId;
    this._message = props.message;
    this._type = props.type;
    this._createdAt = props.createdAt || new Date();
    this._read = props.read || false;
  }

  // Getters
  get id(): string | undefined { return this._id; }
  get userId(): string { return this._userId; }
  get message(): string { return this._message; }
  get type(): 'success' | 'error' | 'info' { return this._type; }
  get createdAt(): Date { return this._createdAt; }
  get read(): boolean { return this._read; }

  toJSON(): any {
    return {
      id: this._id,
      userId: this._userId,
      message: this._message,
      type: this._type,
      createdAt: this._createdAt,
      read: this._read,
    };
  }
}