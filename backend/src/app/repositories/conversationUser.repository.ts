// src/app/repositories/conversationUser.repository.ts

import { ConversationUser } from '@/domain/entities/ConversationUser.entity';
import { IBaseRepository } from './base.repository';
import { ChatParticipantType } from '@/domain/enums/ChatParticipantType';

export interface IConversationUserRepository extends IBaseRepository<ConversationUser, string> {
  /**
   * Add a participant (user/trainer) to a conversation.
   */
  addUserToConversation(
    conversationId: string,
    participantId: string,
    participantRoleType: ChatParticipantType,
    lastReadAt?: Date | null
  ): Promise<ConversationUser>;

  /**
   * Remove a participant from a conversation.
   */
  removeUserFromConversation(
    conversationId: string,
    participantId: string
  ): Promise<void>;

  /**
   * Get all participants in a conversation.
   */
  getUsersInConversation(
    conversationId: string
  ): Promise<ConversationUser[]>;

  /**
   * Update the lastReadAt timestamp for a participant in a conversation.
   */
  updateLastReadAt(
    conversationId: string,
    participantId: string,
    readAt: Date
  ): Promise<void>;

  /**
   * Get the lastReadAt timestamp for a participant in a conversation.
   */
  getLastReadAt(
    conversationId: string,
    participantId: string
  ): Promise<Date | null>;

  /**
   * Check if a participant belongs to a conversation.
   */
  isUserInConversation(
     conversationId: string,
    participantId: string,
   
  ): Promise<boolean>;
  getAllByParticipant(
  participantId: string,
  participantRoleType: ChatParticipantType
): Promise<ConversationUser[]>; 
}
