// src/app/useCases/chat/interfaces/IGetChatSummaryUseCase.ts

import { ChatParticipantType } from "@/domain/enums/ChatParticipantType";

export interface IChatSummaryItemDTO {
  participantId: string; // could be userId or trainerId
  participantRole: ChatParticipantType;
  conversationId?: string;
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
     senderType: ChatParticipantType;
  };
  unreadCount: number;
}

export interface IGetChatSummaryResponseDTO {
  success: boolean;
  status: number;
  data?: IChatSummaryItemDTO[];
  message?: string;
}

export interface IGetChatSummaryUseCase {
  execute(currentUserId: string, currentUserRole:  ChatParticipantType): Promise<IGetChatSummaryResponseDTO>;
}

