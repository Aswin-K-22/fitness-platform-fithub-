import { ChatParticipantType } from "../enums/ChatParticipantType";

//src/domain/entities/conversationUser.entity.ts
interface ConversationUserProps {
  id?: string;
  conversationId: string;
  participantId: string;
  participantRoleType: ChatParticipantType;
  lastReadAt?: Date;
}

export class ConversationUser {
  private _id?: string;
  private _conversationId: string;
  private _participantId: string;
  private _participantRoleType:ChatParticipantType;
  private _lastReadAt?: Date;

  constructor(props: ConversationUserProps) {
    this._id = props.id;
    this._conversationId = props.conversationId;
    this._participantId = props.participantId;
    this._participantRoleType = props.participantRoleType;
    this._lastReadAt = props.lastReadAt;
  }

  get id(): string | null { return this._id ?? null; }
  get conversationId(): string { return this._conversationId; }
  get participantId(): string { return this._participantId; }
  get participantRoleType(): ChatParticipantType { return this._participantRoleType; }
  get lastReadAt(): Date | undefined { return this._lastReadAt; }

  markAsRead(timestamp: Date = new Date()): void {
    this._lastReadAt = timestamp;
  }

  toJSON() {
    return {
      id: this._id,
      conversationId: this._conversationId,
      participantId: this._participantId,
      participantRoleType: this._participantRoleType,
      lastReadAt: this._lastReadAt?.toISOString(),
    };
  }
}
