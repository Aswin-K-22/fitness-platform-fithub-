import { IGetChatSummaryUseCase, IGetChatSummaryResponseDTO, IChatSummaryItemDTO } from "./interfaces/IGetChatSummaryUseCase";
import { IConversationUserRepository } from "@/app/repositories/conversationUser.repository";
import { IMessageRepository } from "@/app/repositories/message.repository";
import { ChatParticipantType } from "@/domain/enums/ChatParticipantType";
import { HttpStatus } from "@/domain/enums/httpStatus.enum";

export class GetChatSummaryUseCase implements IGetChatSummaryUseCase {
  constructor(
    private conversationUserRepo: IConversationUserRepository,
    private messageRepo: IMessageRepository
  ) {}

  async execute(currentUserId: string, currentUserRole: ChatParticipantType): Promise<IGetChatSummaryResponseDTO> {
    if (!currentUserId) {
      return {
        success: false,
        status: HttpStatus.UNAUTHORIZED,
        message: "User not authenticated"
      };
    }

    try {
      // 1. Fetch all conversation participants for this user
      const participantRecords = await this.conversationUserRepo.getAllByParticipant(currentUserId, currentUserRole);
      if (!participantRecords || participantRecords.length === 0) {
        return { success: true, status: HttpStatus.OK, data: [] };
      }

      const summaries: IChatSummaryItemDTO[] = [];

      // 2. For each conversation, gather required info
      for (const participantRecord of participantRecords) {
        const conversationId = participantRecord.conversationId;

        // Find other participant(s) in the conversation
        const allParticipants = await this.conversationUserRepo.getUsersInConversation(conversationId);
        const otherParticipant = allParticipants.find(
          p => !(p.participantId === currentUserId && p.participantRoleType === currentUserRole)
        );

        // Get last message (latest by createdAt)
        const [lastMessage] = await this.messageRepo.getMessagesByConversationId(conversationId, 0, 1);

        // Count unread messages for this user
        const unreadMessages = await this.messageRepo.getUnreadMessagesByConversation(conversationId, currentUserId);

        summaries.push({
          participantId: otherParticipant?.participantId ?? "",
          participantRole: otherParticipant?.participantRoleType ?? ChatParticipantType.USER,
          conversationId,
          lastMessage: lastMessage
            ? {
                id: lastMessage.id!,
                content: lastMessage.content,
                senderId: lastMessage.senderId,
                createdAt: lastMessage.createdAt.toISOString(),
                 senderType: lastMessage.senderType,
              }
            : undefined,
          unreadCount: unreadMessages.length
        });
      }

      return { success: true, status: HttpStatus.OK, data: summaries };

    } catch (err) {
      console.error("Error in GetChatSummaryUseCase:", err);
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch chat summary"
      };
    }
  }
}
