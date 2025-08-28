// src/app/repositories/conversation.repository.ts

import { ChatParticipantType } from '@/domain/enums/ChatParticipantType';
import { IBaseRepository } from './base.repository';
import { Conversation } from '@/domain/entities/Conversation.entity';

export interface IConversationRepository extends IBaseRepository<Conversation, string> {
  // Find all conversations for a user/trainer
  findByUserId(userId: string, skip: number, take: number): Promise<Conversation[]>;

  // Get conversation with participants preloaded
  findWithParticipants(conversationId: string): Promise<Conversation | null>;

  // Check if user is part of conversation
 
  updateLastMessage(conversationId: string, messageId: string): Promise<void>;
  


    findByParticipants(
    participantAId: string,
    participantAType: ChatParticipantType,
    participantBId: string,
    participantBType: ChatParticipantType
  ): Promise<Conversation | null>;
  getConversationsByUserId(userId: string): Promise<{ id: string }[]>;

}
