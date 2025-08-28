// backend/src/infra/repositories/conversation.repository.ts

import { PrismaClient } from '@prisma/client';
import { IConversationRepository } from '@/app/repositories/conversation.repository';
import { BaseRepository } from './base.repository';
import { ChatParticipantType } from '@/domain/enums/ChatParticipantType';
import { Conversation } from '@/domain/entities/Conversation.entity';

export class ConversationRepository
  extends BaseRepository<Conversation>
  implements IConversationRepository
{
  constructor(prisma: PrismaClient) {
    super(prisma, 'conversation');
  }

  protected toDomain(record: any): Conversation {
    return new Conversation({
      id: record.id,
      title: record.title,
      isGroup: record.isGroup,
      lastMessageId: record.lastMessageId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async findByUserId(userId: string, skip: number, take: number): Promise<Conversation[]> {
    const records = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            participantId: userId,
          },
        },
      },
      skip,
      take,
      orderBy: { updatedAt: 'desc' },
    });
    return records.map(this.toDomain);
  }

  async findWithParticipants(conversationId: string): Promise<Conversation | null> {
    const record = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: true,
        lastMessage: true,
      },
    });
    return record ? this.toDomain(record) : null;
  }

  async updateLastMessage(conversationId: string, messageId: string): Promise<void> {
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageId: messageId },
    });
  }

  async findByParticipants(
    participantAId: string,
    participantAType: ChatParticipantType,
    participantBId: string,
    participantBType: ChatParticipantType
  ): Promise<Conversation | null> {
    const record = await this.prisma.conversation.findFirst({
      where: {
        isGroup: false,
        participants: {
          some: {
            participantId: participantAId,
            participantRoleType: participantAType,
          },
        },
        AND: {
          participants: {
            some: {
              participantId: participantBId,
              participantRoleType: participantBType,
            },
          },
        },
      },
    });
    return record ? this.toDomain(record) : null;
  }

  async getConversationsByUserId(userId: string): Promise<{ id: string }[]> {
    const records = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: { participantId: userId },
        },
      },
      select: { id: true },
    });
    return records;
  }
}
