// src/types/chat.types.ts

import type { ChatParticipantType, MessageDTO } from "./chatSocket.types";



export interface IChatSummaryItemDTO {
  participantId: string; // could be userId or trainerId
  participantRole: ChatParticipantType;
  conversationId?: string;
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    senderType :ChatParticipantType
  };
  unreadCount: number;
}




export interface IGetChatSummaryResponseDTO {
  success: boolean;
  status: number;
  data?: IChatSummaryItemDTO[];
  message?: string;
}



export interface GetConversationMessagesResponseDTO {
  success: boolean;
  status: number; // HttpStatus enum numeric value from backend
  message: string;
  data?: {
    messages: MessageDTO[];
    hasMore: boolean;
  };
  error?: {
    code: string;
    message: string;
  };
}
