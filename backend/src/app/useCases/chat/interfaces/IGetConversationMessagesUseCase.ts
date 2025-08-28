// src/app/useCases/chat/interfaces/IGetConversationMessagesUseCase.ts
import { Message } from "@/domain/entities/Message.entity";
import { HttpStatus } from "@/domain/enums/httpStatus.enum";

export interface IGetConversationMessagesResponseDTO {
  success: boolean;
  status: HttpStatus;
  message: string;
  data?: {
    messages: Message[];
    hasMore: boolean; // useful for infinite scroll
  };
  error?: { code: string; message: string };
}

export interface IGetConversationMessagesRequest {
  userId: string;
  conversationId: string;
  before?: string; // messageId (or timestamp if you prefer)
  after?: string;  // messageId (or timestamp)
  limit: number;
}

export interface IGetConversationMessagesUseCase {
  execute(
    params: IGetConversationMessagesRequest
  ): Promise<IGetConversationMessagesResponseDTO>;
}
