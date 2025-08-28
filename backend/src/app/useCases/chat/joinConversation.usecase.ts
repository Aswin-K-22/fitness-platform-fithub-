// src/app/usecases/chat/joinConversation.usecase.ts
import { IJoinConversationUseCase } from "./interfaces/IJoinConversationUseCase";
import { ERRORMESSAGES } from "@/domain/constants/errorMessages.constant";
import { IConversationUserRepository } from "@/app/repositories/conversationUser.repository";




export class JoinConversationUseCase implements IJoinConversationUseCase {
  constructor(
    private conversationUserRepository: IConversationUserRepository,
  ) {}



 async verifyParticipation(userId: string, conversationId: string): Promise<void> {
    const isParticipant = await this.conversationUserRepository.isUserInConversation(conversationId, userId);
    if (!isParticipant) {
      throw new Error(ERRORMESSAGES.UNAUTHORIZED_CONVERSATION_ACCESS.message);
    }
  }
}