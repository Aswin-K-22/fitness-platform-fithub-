// src/app/usecases/chat/MarkMessageReadUseCase.ts

import { IMarkMessageReadUseCase, IMarkMessageReadRequestDTO, IMarkMessageReadResponseDTO } from './interfaces/IMarkMessageReadUseCase';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { MESSAGES } from '@/domain/constants/messages.constant';
import { IConversationRepository } from '@/app/repositories/conversation.repository';
import { IConversationUserRepository } from '@/app/repositories/conversationUser.repository';
import { IMessageRepository } from '@/app/repositories/message.repository';
import { IMessageReadRepository } from '@/app/repositories/messageRead.repository';

export class MarkMessageReadUseCase implements IMarkMessageReadUseCase {
  constructor(
    private conversationsRepository: IConversationRepository,
    private conversationUserRepository: IConversationUserRepository,
    private messagesRepository: IMessageRepository,
    private messageReadRepository: IMessageReadRepository,
  ) {}

  async execute(dto: IMarkMessageReadRequestDTO): Promise<IMarkMessageReadResponseDTO> {
    try {
      // 1. Validate inputs
      if (!dto.conversationId || !dto.userId) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          message: ERRORMESSAGES.CHAT_MISSING_REQUIRED_FIELDS.message,
          error: {
            code: ERRORMESSAGES.CHAT_MISSING_REQUIRED_FIELDS.code,
            message: ERRORMESSAGES.CHAT_MISSING_REQUIRED_FIELDS.message,
          },
        };
      }

      // 2. Verify user is part of the conversation
      const isParticipant = await this.conversationUserRepository.isUserInConversation(dto.userId, dto.conversationId);
      if (!isParticipant) {
        return {
          success: false,
          status: HttpStatus.FORBIDDEN,
          message: ERRORMESSAGES.UNAUTHORIZED_CONVERSATION_ACCESS.message,
          error: {
            code: ERRORMESSAGES.UNAUTHORIZED_CONVERSATION_ACCESS.code,
            message: ERRORMESSAGES.UNAUTHORIZED_CONVERSATION_ACCESS.message,
          },
        };
      }

      // 3. Handle single message read vs. bulk
      if (dto.messageId) {
        // Ensure message belongs to this conversation
        const messageExists = await this.messagesRepository.messageExistsInConversation(dto.messageId, dto.conversationId);
        if (!messageExists) {
          return {
            success: false,
            status: HttpStatus.BAD_REQUEST,
            message: ERRORMESSAGES.MESSAGE_NOT_FOUND.message,
            error: {
              code: ERRORMESSAGES.MESSAGE_NOT_FOUND.code,
              message: ERRORMESSAGES.MESSAGE_NOT_FOUND.message,
            },
          };
        }

        // Mark single message as read
        await this.messageReadRepository.markAsRead(dto.messageId, dto.userId, dto.participantType);

      } else {
        // Bulk: mark all unread messages in conversation
        const unreadMessages = await this.messagesRepository.getUnreadMessagesByConversation(dto.conversationId, dto.userId);

        for (const message of unreadMessages) {
          await this.messageReadRepository.markAsRead(message.id!, dto.userId, dto.participantType);
        }
      }

      // 4. Update lastReadAt in ConversationUser (conversation-level state)
      await this.conversationUserRepository.updateLastReadAt(dto.conversationId, dto.userId, new Date());

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.MESSAGES_MARKED_AS_READ,
      };

    } catch (error: any) {
      console.error('[MarkMessageReadUseCase] Error:', error);
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || ERRORMESSAGES.SERVER_ERROR_CHAT.message,
        error: {
          code: ERRORMESSAGES.SERVER_ERROR_CHAT.code,
          message: error.message || ERRORMESSAGES.SERVER_ERROR_CHAT.message,
        },
      };
    }
  }
}
