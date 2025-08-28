// backend/src/infra/repositories/messageRead.repository.ts

import { PrismaClient } from '@prisma/client';
import { IMessageReadRepository } from '@/app/repositories/messageRead.repository';
import { MessageRead } from '@/domain/entities/MessageRead.entity';
import { ChatParticipantType } from '@/domain/enums/ChatParticipantType';

export class MessageReadRepository implements IMessageReadRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(record: any): MessageRead {
    return new MessageRead({
      id: record.id,
      messageId: record.messageId,
      participantId: record.participantId,
      participantType: record.participantType,
      readAt: record.readAt,
    });
  }

  async markAsRead(
    messageId: string,
    participantId: string,
    participantType: ChatParticipantType
  ): Promise<MessageRead> {
    const record = await this.prisma.messageRead.upsert({
      where: {
        messageId_participantId_participantType: {
          messageId,
          participantId,
          participantType,
        },
      },
      update: { readAt: new Date() },
      create: {
        messageId,
        participantId,
        participantType,
        readAt: new Date(),
      },
    });

    return this.toDomain(record);
  }

  async getReadsForMessage(messageId: string): Promise<MessageRead[]> {
    const records = await this.prisma.messageRead.findMany({
      where: { messageId },
    });
    return records.map(this.toDomain);
  }

  async hasUserReadMessage(
    messageId: string,
    participantId: string,
    participantType: ChatParticipantType
  ): Promise<boolean> {
    const record = await this.prisma.messageRead.findUnique({
      where: {
        messageId_participantId_participantType: {
          messageId,
          participantId,
          participantType,
        },
      },
      select: { readAt: true },
    });

    return !!record?.readAt;
  }

  async getUnreadMessagesByConversation(
    conversationId: string,
    participantId: string
  ): Promise<MessageRead[]> {
    // Get all messages in the conversation
    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      select: { id: true },
    });

    if (messages.length === 0) return [];

    const messageIds = messages.map((m) => m.id);

    const records = await this.prisma.messageRead.findMany({
      where: {
        messageId: { in: messageIds },
        participantId,
        OR: [{ readAt: null }, { readAt: undefined }],
      },
    });

    return records.map(this.toDomain);
  }
}
