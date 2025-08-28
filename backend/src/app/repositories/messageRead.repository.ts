// src/app/repositories/messageRead.repository.ts

import { MessageRead } from '@/domain/entities/MessageRead.entity';
import { ChatParticipantType } from '@/domain/enums/ChatParticipantType';

export interface IMessageReadRepository {
  /**
   * Mark a single message as read by a participant.
   */
  markAsRead(
    messageId: string,
    participantId: string,
    participantType: ChatParticipantType
  ): Promise<MessageRead>;

  /**
   * Get all read receipts for a given message.
   */
  getReadsForMessage(messageId: string): Promise<MessageRead[]>;

  /**
   * Check if a participant has already read a message.
   */
  hasUserReadMessage(
    messageId: string,
    participantId: string,
    participantType: ChatParticipantType
  ): Promise<boolean>;

  /**
   * Get all unread messages for a participant in a conversation.
   * (useful for bulk mark-as-read logic)
   */
  getUnreadMessagesByConversation(
    conversationId: string,
    participantId: string
  ): Promise<MessageRead[]>;
}

