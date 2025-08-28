// src/types/chat/chatSocket.types.ts

export type ChatParticipantType = 'USER' | 'TRAINER';


// --- Messages ---
export interface ConversationCreatedEvent {
  conversationId: string;
}

export interface SendMessagePayload {
  conversationId?: string | null; // optional if creating new conversation
  content: string;
  tempId: string; // for optimistic UI
  receiverId?: string; // required if no conversation exists
  isGroup?: boolean; // default false
}

export interface MessageDTO {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: ChatParticipantType;
  content: string;
  createdAt: string; // ISO date
}

export interface MessageSentAck {
  success: boolean;
  tempId: string;
  message?: MessageDTO;
  error?: string;
}

// --- Typing ---
export interface TypingEvent {
  conversationId: string;
  isTyping: boolean;
  senderType: ChatParticipantType;
  userId?: string;
}

// --- User status ---
export interface UserStatusEvent {
  userId: string;
  status: 'online' | 'offline';
}

// --- Message read ---
export interface MessageReadEvent {
  messageId?: string;
  userId: string;
  participantType: ChatParticipantType;
  conversationId: string;
}

export interface MarkReadAck {
  success: boolean;
  error?: string;
}
