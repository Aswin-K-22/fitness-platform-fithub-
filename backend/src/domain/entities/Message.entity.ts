import { ChatParticipantType } from "../enums/ChatParticipantType";

//src/domain/entities/Message.entity.ts
interface MessageProps {
  id?: string;
  conversationId: string;
  senderId: string;
   senderType: ChatParticipantType;
  content: string;
  createdAt?: Date;
}

export class Message {
  private _id?: string;
  private _conversationId: string;
  private _senderId: string;
  private _senderType: ChatParticipantType;
  private _content: string;
  private _createdAt: Date;

  constructor(props: MessageProps) {
    this._id = props.id;
    this._conversationId = props.conversationId;
    this._senderId = props.senderId;
    this._senderType = props.senderType;
    this._content = props.content;
    this._createdAt = props.createdAt ?? new Date();
  }

  get id(): string | null { return this._id ?? null; }
  get conversationId(): string { return this._conversationId; }
  get senderId(): string { return this._senderId; }
  get senderType():ChatParticipantType{ return this._senderType; }
  get content(): string { return this._content; }
  get createdAt(): Date { return this._createdAt; }

  toJSON() {
    return {
      id: this._id,
      conversationId: this._conversationId,
      senderId: this._senderId,
      senderType: this._senderType,
      content: this._content,
      createdAt: this._createdAt.toISOString(),
    };
  }
}
