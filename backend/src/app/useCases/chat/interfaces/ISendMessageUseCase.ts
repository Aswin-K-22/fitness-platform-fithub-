// src/app/usecases/chat/interfaces/ISendMessageUseCase.ts

import { HttpStatus } from '@/domain/enums/httpStatus.enum';
import { Message } from '@/domain/entities/Message.entity';
import { ISendMessageRequestDTO } from '@/domain/dtos/user/sendMessageRequest.dto';

export interface ISendMessageResponseDTO {
  success: boolean;
  status: HttpStatus;
  message: string;
  data?: { 
    message: Message; 
    conversationId: string; 
  };
  error?: { code: string; message: string };
}


export interface ISendMessageUseCase {
  execute(dto: ISendMessageRequestDTO): Promise<ISendMessageResponseDTO>;
}
