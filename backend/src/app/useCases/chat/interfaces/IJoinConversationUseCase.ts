
// src/app/usecases/chat/interface/joinConversation.usecase.ts
export interface IJoinConversationUseCase {
  verifyParticipation(userId: string, conversationId: string): Promise<void>;
}