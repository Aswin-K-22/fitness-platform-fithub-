//src/domain/entities/MessageRead.entity.ts
import { ChatParticipantType } from "../enums/ChatParticipantType";

interface MessageReadProps {
  id?: string;
  messageId: string;
  participantId: string;
  participantType: ChatParticipantType ;
  readAt?: Date | null;
}

export class MessageRead {
  private _id?: string;
  private _messageId: string;
  private _participantId: string;
  private _participantType:  ChatParticipantType ;
  private _readAt: Date | null;

  constructor(props: MessageReadProps) {
    this._id = props.id;
    this._messageId = props.messageId;
    this._participantId = props.participantId;
    this._participantType = props.participantType;
    this._readAt = props.readAt ?? null;
  }

  get id(): string | null { return this._id ?? null; }
  get messageId(): string { return this._messageId; }
  get participantId(): string { return this._participantId; }
  get participantType(): ChatParticipantType { return this._participantType; }
  get readAt(): Date | null { return this._readAt; }

  toJSON() {
    return {
      id: this._id,
      messageId: this._messageId,
      participantId: this._participantId,
      participantType: this._participantType,
      readAt: this._readAt ? this._readAt.toISOString() : null,
    };
  }
}
