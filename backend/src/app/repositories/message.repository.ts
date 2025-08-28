// src/app/repositories/message.repository.ts

import { IBaseRepository } from './base.repository';
import { Message } from '@/domain/entities/Message.entity';

export interface IMessageRepository extends IBaseRepository<Message, string> {
 getMessagesByConversationId(
    conversationId: string,
    skip: number,
    take: number
  ): Promise<Message[]>;

   getMessagesByConversationIdWithCursor(
    conversationId: string,
    params: { before?: string; after?: string; limit: number }
  ): Promise<Message[]>;
  // Count total messages in a conversation
  countByConversationId(conversationId: string): Promise<number>;
  

  // Mark all messages in a conversation as read for a specific user
  markMessagesAsRead(conversationId: string, userId: string): Promise<void>;

// Get unread messages in a conversation for a user
  getUnreadMessagesByConversation(conversationId: string, userId: string): Promise<Message[]>;

  // Check if a message exists in a conversation
  messageExistsInConversation(messageId: string, conversationId: string): Promise<boolean>;

  // Count unread messages for a user across all conversations
  countUnreadMessages(userId: string): Promise<number>;
}
