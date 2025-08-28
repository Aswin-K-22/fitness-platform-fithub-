//src/domain/entities/conversation.entity.ts
interface ConversationProps {
  id?: string;
  title: string | null;
  isGroup: boolean;
  lastMessageId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Conversation {
  private _id?: string;
  private _title:  string | null;
  private _isGroup: boolean;
  private _lastMessageId?: string;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: ConversationProps) {
    this._id = props.id;
    this._title = props.title;
    this._isGroup = props.isGroup;
    this._lastMessageId = props.lastMessageId;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get id(): string | null { return this._id ?? null; }
  get title():  string | null { return this._title; }
  get isGroup(): boolean { return this._isGroup; }
  get lastMessageId(): string | undefined { return this._lastMessageId; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  toJSON() {
    return {
      id: this._id,
      title: this._title,
      isGroup: this._isGroup,
      lastMessageId: this._lastMessageId,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
