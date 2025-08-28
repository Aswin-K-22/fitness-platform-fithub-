// src/app/usecases/chat/CreateConversationUseCase.ts

import { IConversationRepository } from "@/app/repositories/conversation.repository";
import { IConversationUserRepository } from "@/app/repositories/conversationUser.repository";
import { HttpStatus } from "@/domain/enums/httpStatus.enum";
import { ERRORMESSAGES } from "@/domain/constants/errorMessages.constant";
import { Conversation } from "@/domain/entities/Conversation.entity";
import { ICreateConversationRequestDTO, ICreateConversationResponseDTO, ICreateConversationUseCase } from "./interfaces/ICreateConversationUseCase";
import { MESSAGES } from "@/domain/constants/messages.constant";

export class CreateConversationUseCase implements ICreateConversationUseCase {
  constructor(
    private conversationsRepository: IConversationRepository,
    private conversationUserRepository: IConversationUserRepository
  ) {}

  async execute(dto: ICreateConversationRequestDTO): Promise<ICreateConversationResponseDTO> {
    try {
      console.log(`[CreateConversationUseCase] Creating conversation for participantAId=${dto.participantAId}, participantBId=${dto.participantBId}`);
      // 1. Check if conversation already exists
      const existingConversation = await this.conversationsRepository.findByParticipants(
        dto.participantAId,
        dto.participantAType,
        dto.participantBId,
        dto.participantBType
      );

      if (existingConversation) {
        return {
          success: true,
          status: HttpStatus.OK,
          message: MESSAGES.CONVERSATION_ALREADY_CREATED,
          data: existingConversation
        };
      }

      // 2. Create new conversation
      const conversationEntity = new Conversation({ title: null, isGroup: false });
      const newConversation = await this.conversationsRepository.create(conversationEntity);
console.log(`[CreateConversationUseCase] Created conversation with id=${newConversation.id}`);
      // 3. Create ConversationUser entries
     const participantA = await this.conversationUserRepository.addUserToConversation(
        newConversation.id!,
        dto.participantAId,
        dto.participantAType,
        null
      );
      console.log(`[CreateConversationUseCase] Added participantAId=${dto.participantAId} as ${dto.participantAType}`);


      const participantB  = await this.conversationUserRepository.addUserToConversation(
        newConversation.id!,
        dto.participantBId,
        dto.participantBType,
        null
      );
      console.log(`[CreateConversationUseCase] Added participantBId=${dto.participantBId} as ${dto.participantBType}`);


      // 4. Return success response
     return {
        success: true,
        status: HttpStatus.CREATED,
        message: MESSAGES.CONVERSATION_CREATED_SUCCESSFULLY,
        data: newConversation,
      };
    } catch (error: any) {
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ERRORMESSAGES.CONVERSATION_CREATION_FAILED.message,
        error: {
          code: ERRORMESSAGES.CONVERSATION_CREATION_FAILED.code,
          message: error.message || ERRORMESSAGES.CONVERSATION_CREATION_FAILED.message,
        },
      };
    }
  }
}
