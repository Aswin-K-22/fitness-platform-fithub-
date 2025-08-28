// src/domain/dtos/sendMessageRequest.dto.ts

import { ChatParticipantType } from "@/domain/enums/ChatParticipantType";

export interface ISendMessageRequestDTO {
  conversationId: string;
  senderId: string;
  senderType: ChatParticipantType
  content: string;
  tempId?: string;
}
