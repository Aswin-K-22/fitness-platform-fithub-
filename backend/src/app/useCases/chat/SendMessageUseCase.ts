// src/app/usecases/chat/SendMessageUseCase.ts
import { ISendMessageUseCase, ISendMessageResponseDTO } from './interfaces/ISendMessageUseCase';
import { ISendMessageRequestDTO } from '@/domain/dtos/user/sendMessageRequest.dto';
import { Message } from '@/domain/entities/Message.entity';
import { IMessageRepository } from '@/app/repositories/message.repository';
import { IConversationRepository } from '@/app/repositories/conversation.repository';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { ERRORMESSAGES } from '@/domain/constants/errorMessages.constant';
import { MESSAGES } from '@/domain/constants/messages.constant';

export class SendMessageUseCase implements ISendMessageUseCase {
  constructor(
    private messageRepository: IMessageRepository,
    private conversationRepository: IConversationRepository
  ) {}

  async execute(dto: ISendMessageRequestDTO): Promise<ISendMessageResponseDTO> {
    try {
     if (!dto.conversationId || !dto.senderId || !dto.senderType || !dto.content) {
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

      // Build entity
      const message = new Message(dto);

      // Persist message
      const createdMessage = await this.messageRepository.create(message);

      if (!createdMessage.id) {
        return {
          success: false,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: ERRORMESSAGES.MESSAGE_CREATION_FAILED.message,
          error: {
            code: ERRORMESSAGES.MESSAGE_CREATION_FAILED.code,
            message: ERRORMESSAGES.MESSAGE_CREATION_FAILED.message,
          },
        };
      }

      // Update conversation's last message
      await this.conversationRepository.updateLastMessage(dto.conversationId, createdMessage.id);

      return {
        success: true,
        status: HttpStatus.CREATED,
        message: MESSAGES.MESSAGE_SENT,
        data: { 
          message: createdMessage,
          conversationId: dto.conversationId
        },
      };

    } catch (error) {
      console.error('[SendMessageUseCase] Error:', error);
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ERRORMESSAGES.GENERIC_ERROR.message,
        error: {
          code: ERRORMESSAGES.GENERIC_ERROR.code,
          message: ERRORMESSAGES.GENERIC_ERROR.message,
        },
      };
    }
  }
}
