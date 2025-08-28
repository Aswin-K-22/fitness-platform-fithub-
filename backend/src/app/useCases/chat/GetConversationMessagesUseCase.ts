// src/app/useCases/chat/GetConversationMessagesUseCase.ts

import { IConversationUserRepository } from "@/app/repositories/conversationUser.repository";
import { IMessageRepository } from "@/app/repositories/message.repository";
import { HttpStatus } from "@/domain/enums/httpStatus.enum";
import { ERRORMESSAGES } from "@/domain/constants/errorMessages.constant";
import { MESSAGES } from "@/domain/constants/messages.constant";
import { IGetConversationMessagesRequest, IGetConversationMessagesResponseDTO, IGetConversationMessagesUseCase } from "./interfaces/IGetConversationMessagesUseCase";

export class GetConversationMessagesUseCase implements IGetConversationMessagesUseCase {
  constructor(
    private messageRepository: IMessageRepository,
    private conversationUserRepository: IConversationUserRepository
  ) {}

  async execute(dto: IGetConversationMessagesRequest): Promise<IGetConversationMessagesResponseDTO> {
    try {
      // 1. Ensure user is in the conversation
      const isParticipant = await this.conversationUserRepository.isUserInConversation(
    
        dto.conversationId,
            dto.userId,
      );

      if (!isParticipant) {
        return {
          success: false,
          status: HttpStatus.FORBIDDEN,
          message: ERRORMESSAGES.CHAT_NOT_PARTICIPANT.message,
          error: {
            code: ERRORMESSAGES.CHAT_NOT_PARTICIPANT.code,
            message: ERRORMESSAGES.CHAT_NOT_PARTICIPANT.message,
          },
        };
      }

      // 2. Fetch messages with cursor
      const messages = await this.messageRepository.getMessagesByConversationIdWithCursor(
        dto.conversationId,
        { before: dto.before, after: dto.after, limit: dto.limit + 1 } // fetch one extra to check hasMore
      );

      const hasMore = messages.length > dto.limit;
      const slicedMessages = hasMore ? messages.slice(0, dto.limit) : messages;

      return {
        success: true,
        status: HttpStatus.OK,
        message: MESSAGES.SUCCESS,
        data: {
          messages: slicedMessages,
          hasMore,
        },
      };
    } catch (error: any) {
      console.error("[GetConversationMessagesUseCase] Error:", error);
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ERRORMESSAGES.SERVER_ERROR_CHAT.message,
        error: {
          code: ERRORMESSAGES.SERVER_ERROR_CHAT.code,
          message: error.message || ERRORMESSAGES.SERVER_ERROR_CHAT.message,
        },
      };
    }
  }
}
