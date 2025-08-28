// backend/src/infra/repositories/conversationUser.repository.ts

import { PrismaClient } from '@prisma/client';
import { ConversationUser } from '@/domain/entities/ConversationUser.entity';
import { IConversationUserRepository } from '@/app/repositories/conversationUser.repository';
import { BaseRepository } from './base.repository';
import { ChatParticipantType } from '@/domain/enums/ChatParticipantType';

export class ConversationUserRepository
  extends BaseRepository<ConversationUser>
  implements IConversationUserRepository
{
  constructor(prisma: PrismaClient) {
    super(prisma, 'conversationUser');
  }

  protected toDomain(record: any): ConversationUser {
    return new ConversationUser({
      id: record.id,
      conversationId: record.conversationId,
      participantId: record.participantId,
      participantRoleType: record.participantRoleType,
      lastReadAt: record.lastReadAt,
    });
  }

  async getAllByParticipant(
  participantId: string,
  participantRoleType?: ChatParticipantType
): Promise<ConversationUser[]> {
  const whereClause: any = { participantId };
  if (participantRoleType) {
    whereClause.participantRoleType = participantRoleType;
  }

  const records = await this.prisma.conversationUser.findMany({
    where: whereClause,
  });

  return records.map(this.toDomain);
}

  async addUserToConversation(
    conversationId: string,
    participantId: string,
    participantRoleType: ChatParticipantType,
    lastReadAt?: Date | null
  ): Promise<ConversationUser> {
    const record = await this.prisma.conversationUser.create({
      data: {
        conversationId,
        participantId,
        participantRoleType,
        lastReadAt: lastReadAt ?? null,
      },
    });
    return this.toDomain(record);
  }

  async removeUserFromConversation(conversationId: string, participantId: string): Promise<void> {
    await this.prisma.conversationUser.deleteMany({
      where: {
        conversationId,
        participantId,
      },
    });
  }

  async getUsersInConversation(conversationId: string): Promise<ConversationUser[]> {
    const records = await this.prisma.conversationUser.findMany({
      where: { conversationId },
    });
    return records.map(this.toDomain);
  }

  async updateLastReadAt(conversationId: string, participantId: string, readAt: Date): Promise<void> {
    await this.prisma.conversationUser.updateMany({
      where: {
        conversationId,
        participantId,
      },
      data: { lastReadAt: readAt },
    });
  }

  async getLastReadAt(conversationId: string, participantId: string): Promise<Date | null> {
    const record = await this.prisma.conversationUser.findFirst({
      where: {
        conversationId,
        participantId,
      },
      select: { lastReadAt: true },
    });
    return record?.lastReadAt ?? null;
  }

async isUserInConversation(conversationId: string,participantId: string,): Promise<boolean> {
  console.log(`[ConversationUserRepository] Checking if participantId=${participantId} is in conversationId=${conversationId}`);
  const count = await this.prisma.conversationUser.count({
    where: {
      participantId,
      conversationId,
    },
  });
  console.log(`[ConversationUserRepository] Found ${count} records for participantId=${participantId} in conversationId=${conversationId}`);
  return count > 0;
}
}
