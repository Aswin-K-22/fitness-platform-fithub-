// src/app/usecases/chat/interfaces/IMarkMessageReadUseCase.ts
import { ChatParticipantType } from '@/domain/enums/ChatParticipantType';
import { HttpStatus } from '@/domain/enums/httpStatus.enum';

export interface IMarkMessageReadRequestDTO {
  messageId?: string;
  conversationId: string;
  userId: string; 
  participantType: ChatParticipantType 
}

export interface IMarkMessageReadResponseDTO {
  success: boolean;
  status: HttpStatus;
  message: string;
  error?: { code: string; message: string };
}

export interface IMarkMessageReadUseCase {
  execute(dto: IMarkMessageReadRequestDTO): Promise<IMarkMessageReadResponseDTO>;
}