import { ChatParticipantType } from '../enums/ChatParticipantType';

export interface IChatMessageRequestToEntity {
  senderId: string;
  senderType: ChatParticipantType;
  receiverId: string;
  receiverType: ChatParticipantType;
  message: string;
}
