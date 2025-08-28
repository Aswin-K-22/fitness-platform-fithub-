// src/app/usecases/chat/interface/GetUserConversationsUseCase.ts

export interface UserConversationDTO {
  id: string;
}

export interface IGetUserConversationsUseCase {
  execute(userId: string): Promise<UserConversationDTO[]>;
}

