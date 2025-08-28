// backend/src/infra/repositories/message.repository.ts

import { PrismaClient } from '@prisma/client';
import { Message } from '@/domain/entities/Message.entity';
import { IMessageRepository } from '@/app/repositories/message.repository';
import { BaseRepository } from './base.repository';

export class MessageRepository
  extends BaseRepository<Message>
  implements IMessageRepository
{
  constructor(prisma: PrismaClient) {
    super(prisma, 'message');
  }

  protected toDomain(record: any): Message {
    return new Message({
      id: record.id,
      conversationId: record.conversationId,
      senderId: record.senderId,
      senderType: record.senderType,
      content: record.content,
      createdAt: record.createdAt,
    });
  }

  async getMessagesByConversationId(
    conversationId: string,
    skip: number,
    take: number
  ): Promise<Message[]> {
    const records = await this.prisma.message.findMany({
      where: { conversationId },
      skip,
      take,
      orderBy: { createdAt: 'asc' },
    });
    return records.map(this.toDomain);
  }

  async getMessagesByConversationIdWithCursor(
    conversationId: string,
    params: { before?: string; after?: string; limit: number }
  ): Promise<Message[]> {
    const { before, after, limit } = params;

    let cursorCondition: any = {};
    if (before) {
      // Fetch older messages (before = older)
      cursorCondition = {
        createdAt: {
          lt: (
            await this.prisma.message.findUnique({ where: { id: before } })
          )?.createdAt,
        },
      };
    } else if (after) {
      // Fetch newer messages (after = recent)
      cursorCondition = {
        createdAt: {
          gt: (
            await this.prisma.message.findUnique({ where: { id: after } })
          )?.createdAt,
        },
      };
    }

    const records = await this.prisma.message.findMany({
      where: {
        conversationId,
        ...cursorCondition,
      },
      take: limit,
      orderBy: { createdAt: 'desc' }, // always fetch newest first
    });

    // Return in ascending order (for UI consistency: oldest → newest)
    return records.reverse().map((record) => this.toDomain(record));
  }
  
  async countByConversationId(conversationId: string): Promise<number> {
    return this.prisma.message.count({
      where: { conversationId },
    });
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      select: { id: true },
    });

    if (messages.length === 0) return;

    // Upsert read records for each message
    await Promise.all(
      messages.map((msg) =>
        this.prisma.messageRead.upsert({
          where: {
            messageId_participantId_participantType: {
              messageId: msg.id,
              participantId: userId,
              participantType: 'USER', // assuming marking read is only for USER role
            },
          },
          update: { readAt: new Date() },
          create: {
            messageId: msg.id,
            participantId: userId,
            participantType: 'USER',
            readAt: new Date(),
          },
        })
      )
    );
  }

  async getUnreadMessagesByConversation(
    conversationId: string,
    userId: string
  ): Promise<Message[]> {
    const records = await this.prisma.message.findMany({
      where: {
        conversationId,
        NOT: {
          reads: {
            some: {
              participantId: userId,
              readAt: { not: null },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return records.map(this.toDomain);
  }

  async messageExistsInConversation(
    messageId: string,
    conversationId: string
  ): Promise<boolean> {
    const count = await this.prisma.message.count({
      where: {
        id: messageId,
        conversationId,
      },
    });
    return count > 0;
  }

  async countUnreadMessages(userId: string): Promise<number> {
    return this.prisma.message.count({
      where: {
        NOT: {
          reads: {
            some: {
              participantId: userId,
              readAt: { not: null },
            },
          },
        },
      },
    });
  }
}
