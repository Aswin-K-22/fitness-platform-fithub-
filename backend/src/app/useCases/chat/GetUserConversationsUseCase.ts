// src/app/usecases/chat/GetUserConversationsUseCase.ts

import { IConversationRepository } from "@/app/repositories/conversation.repository";
import { IGetUserConversationsUseCase, UserConversationDTO } from "./interfaces/IGetUserConversationsUseCase";


export class GetUserConversationsUseCase implements IGetUserConversationsUseCase {
  constructor(private conversationsRepository: IConversationRepository) {}

  async execute(userId: string): Promise<UserConversationDTO[]> {
    if (!userId) {
      throw new Error("UserId is required");
    }
    return this.conversationsRepository.getConversationsByUserId(userId);
  }
}
