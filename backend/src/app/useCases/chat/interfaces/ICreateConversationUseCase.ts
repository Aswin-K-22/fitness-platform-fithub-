// src/app/usecases/chat/interface/ICreateConversationUseCase.ts
import { Conversation } from "@/domain/entities/Conversation.entity";
import { ChatParticipantType } from "@/domain/enums/ChatParticipantType";
import { HttpStatus } from "@/domain/enums/httpStatus.enum";

export interface ICreateConversationRequestDTO {
  participantAId: string;
  participantAType: ChatParticipantType;
  participantBId: string;
  participantBType: ChatParticipantType;
 
}

export interface ICreateConversationResponseDTO {
  success: boolean;
  status: HttpStatus;
  message: string;
  data?:Conversation ;
  error?: { code: string; message: string };
}
export interface ICreateConversationUseCase{
     execute(dto: ICreateConversationRequestDTO): Promise<ICreateConversationResponseDTO>;
}