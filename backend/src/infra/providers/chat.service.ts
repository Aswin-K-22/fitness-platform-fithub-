//src/infra/providers/chat.service.ts
import { Namespace, Socket } from "socket.io";
import cookie from "cookie";
import { ITokenService } from "@/app/providers/token.service";
import { MarkMessageReadUseCase } from "@/app/useCases/chat/MarkMessageReadUseCase";
import { SendMessageUseCase } from "@/app/useCases/chat/SendMessageUseCase";
import { IGetUserConversationsUseCase, UserConversationDTO } from "@/app/useCases/chat/interfaces/IGetUserConversationsUseCase";
import { ERRORMESSAGES } from "@/domain/constants/errorMessages.constant";
import { MESSAGES } from "@/domain/constants/messages.constant";
import { IJoinConversationUseCase } from "@/app/useCases/chat/interfaces/IJoinConversationUseCase";
import { ICreateConversationUseCase, ICreateConversationRequestDTO, ICreateConversationResponseDTO } from "@/app/useCases/chat/interfaces/ICreateConversationUseCase";
import { ChatParticipantType } from "@/domain/enums/ChatParticipantType";
import { IMarkMessageReadRequestDTO, IMarkMessageReadResponseDTO } from "@/app/useCases/chat/interfaces/IMarkMessageReadUseCase";
import { ISendMessageResponseDTO } from "@/app/useCases/chat/interfaces/ISendMessageUseCase";
import { Message } from "@/domain/entities/Message.entity";
import { ISendMessageRequestDTO } from "@/domain/dtos/user/sendMessageRequest.dto";

interface CustomSocket extends Socket {
  data: {
    id?: string;
  };
}

export class ChatService {
  private connectedUsers: Map<string, Set<Socket>> = new Map();

  constructor(
    private io: Namespace,
    private tokenService: ITokenService,
    private roleType: "user" | "trainer",
    private markMessageReadUseCase: MarkMessageReadUseCase,
    private sendMessageUseCase: SendMessageUseCase,
    private getUserConversationsUseCase: IGetUserConversationsUseCase,
    private joinConversationUseCase: IJoinConversationUseCase,
    private createConversationUseCase: ICreateConversationUseCase
  ) {
    this.setupSocketEvents();
  }

  /**
   * Broadcasts an event to both namespaces (/chat/user and /chat/trainer) for a given conversation.
   * Optionally excludes a specific socket from receiving the event in the current namespace.
   */
private broadcastToAllNamespaces(
  conversationId: string,
  event: string,
  payload: any,
  excludeSocket?: Socket
) {
  // Broadcast to current namespace
  if (excludeSocket) {
    excludeSocket.to(conversationId).emit(event, payload);
  } else {
    this.io.to(conversationId).emit(event, payload);
  }
  console.log(
    `[ChatService] Broadcasted '${event}' to conversationId=${conversationId} in ${this.roleType} namespace`
  );

  // Broadcast to opposite namespace
  const otherNamespace = this.roleType === "user"
    ? this.io.server.of("/chat/trainer")
    : this.io.server.of("/chat/user");
  otherNamespace.to(conversationId).emit(event, payload);
  console.log(
    `[ChatService] Broadcasted '${event}' to conversationId=${conversationId} in ${
      this.roleType === "user" ? "trainer" : "user"
    } namespace`
  );
}
  private setupSocketEvents() {
    // Middleware for socket authentication
    this.io.use(async (socket: CustomSocket, next) => {
      console.log(`[ChatService] [Middleware] Incoming socket connection: ${socket.id}`);
      try {
        const cookies = cookie.parse(socket.handshake.headers.cookie || "");
        const token = this.roleType === "user" ? cookies.userAccessToken : cookies.trainerAccessToken;

        if (!token) {
          console.warn(`[ChatService] No token provided for socketId=${socket.id}`);
          return next(new Error(ERRORMESSAGES.AUTH_USER_NOT_AUTHENTICATED.message));
        }

        const payload = await this.tokenService.verifyAccessToken(token);
        if (!payload?.id) {
          console.warn(`[ChatService] Invalid token for socketId=${socket.id}`);
          return next(new Error(ERRORMESSAGES.AUTH_INVALID_ACCESS_TOKEN.message));
        }

        socket.data.id = payload.id;
        next();
      } catch (error) {
        console.error(`[ChatService] Token verification failed for socket ${socket.id}:`, error);
        return next(new Error(ERRORMESSAGES.AUTH_INVALID_ACCESS_TOKEN.message));
      }
    });

    this.io.on("connection", (socket: CustomSocket) => {
      const userId = socket.data.id!;
      console.log(`[ChatService] Socket connected: ${socket.id} for userId=${userId}`);

      // Track connected sockets
      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, new Set());
      }
      this.connectedUsers.get(userId)!.add(socket);
      this.broadcastUserStatus(userId, "online");

      // Join conversation
socket.on("joinConversation", async (conversationId: string) => {
  if (!conversationId || !userId) {
    console.warn(`[ChatService] Invalid joinConversation data: conversationId=${conversationId}, userId=${userId}`);
    socket.emit("error", { message: ERRORMESSAGES.INVALID_INPUT_CHAT.message });
    return;
  }

  try {
    console.log(`[ChatService] Verifying participation for userId=${userId}, conversationId=${conversationId}, roleType=${this.roleType}`);
    await this.joinConversationUseCase.verifyParticipation(userId, conversationId);
    socket.join(conversationId);
    console.log(`[ChatService] User ${userId} joined conversation ${conversationId}`);
    
    socket.emit("joinedConversation", { conversationId });
    const socketsInRoom = await this.io.in(conversationId).allSockets();
    console.log(`[ChatService] Sockets in room ${conversationId}:`, Array.from(socketsInRoom));
  } catch (error: any) {
    console.error(`[ChatService] Failed to join userId=${userId} to conversationId=${conversationId}:`, error.message);
    socket.emit("error", { message: error.message || ERRORMESSAGES.SERVER_ERROR_CHAT.message });
  }
});

      // Send message
socket.on(
  "sendMessage",
  async (data: {
    conversationId?: string;
    content: string;
    tempId: string;
    receiverId: string;
    isGroup: boolean;
  }) => {
    if (!data.content || !data.tempId || (!data.conversationId && !data.receiverId)) {
      console.warn(`[ChatService] Invalid sendMessage data from userId=${userId}`, data);
      socket.emit("messageSent", {
        success: false,
        tempId: data.tempId,
        error: ERRORMESSAGES.INVALID_INPUT_CHAT.message,
      });
      return;
    }

    let conversationId = data.conversationId;

    // Create new conversation if none exists
    if (!conversationId && !data.isGroup) {
      try {
        const createConversationDTO: ICreateConversationRequestDTO = {
          participantAId: userId,
          participantAType: this.roleType === "user" ? ChatParticipantType.USER : ChatParticipantType.TRAINER,
          participantBId: data.receiverId,
          participantBType: this.roleType === "user" ? ChatParticipantType.TRAINER : ChatParticipantType.USER,
        };

        const result: ICreateConversationResponseDTO = await this.createConversationUseCase.execute(createConversationDTO);
        if (!result.success || !result.data?.id) {
          console.error(`[ChatService] Failed to create conversation for userId=${userId}`, result.error);
          socket.emit("messageSent", {
            success: false,
            tempId: data.tempId,
            error: result.error?.message || ERRORMESSAGES.SERVER_ERROR_CHAT.message,
          });
          return;
        }
        conversationId = result.data.id;

        // Emit conversationCreated event to both namespaces
        console.log(`[ChatService] Emitting conversationCreated for conversationId=${conversationId}`);
        this.broadcastToAllNamespaces(
          conversationId,
          "conversationCreated",
          { conversationId },
          undefined // Include all sockets, including sender
        );
      } catch (error: any) {
        console.error(`[ChatService] Error creating conversation for userId=${userId}:`, error);
        socket.emit("messageSent", {
          success: false,
          tempId: data.tempId,
          error: ERRORMESSAGES.SERVER_ERROR_CHAT.message,
        });
        return;
      }
    }

    if (!conversationId) {
      console.warn(`[ChatService] No conversationId for userId=${userId}`);
      socket.emit("messageSent", {
        success: false,
        tempId: data.tempId,
        error: ERRORMESSAGES.INVALID_INPUT_CHAT.message,
      });
      return;
    }

    console.log(
      `[ChatService] Sending message from userId=${userId} in conversationId=${conversationId}, tempId=${data.tempId}`
    );

    const sendMessageDTO: ISendMessageRequestDTO = {
      senderId: userId,
      senderType: this.roleType === "user" ? ChatParticipantType.USER : ChatParticipantType.TRAINER,
      conversationId,
      content: data.content,
      tempId: data.tempId,
    };

    try {
      const result: ISendMessageResponseDTO = await this.sendMessageUseCase.execute(sendMessageDTO);
      if (result.success && result.data?.message) {
        const savedMessage: Message = result.data.message;
        socket.emit("messageSent", {
          success: true,
          tempId: data.tempId,
          message: savedMessage.toJSON(),
        });

        // Broadcast to all participants in both namespaces
        this.broadcastToAllNamespaces(
          conversationId,
          "newMessage",
          savedMessage.toJSON(),
          socket // Exclude sender to avoid duplicate message
        );

        console.log(
          `[ChatService] ${MESSAGES.MESSAGE_SENT} to conversationId=${conversationId} by userId=${userId}, messageId=${savedMessage.id}`
        );
      } else {
        socket.emit("messageSent", {
          success: false,
          tempId: data.tempId,
          error: result.error?.message || ERRORMESSAGES.SERVER_ERROR_CHAT.message,
        });
      }
    } catch (error: any) {
      console.error(`[ChatService] Error sending message for userId=${userId}:`, error);
      socket.emit("messageSent", {
        success: false,
        tempId: data.tempId,
        error: ERRORMESSAGES.SERVER_ERROR_CHAT.message,
      });
    }
  }
);

      // Typing event
socket.on(
  "typing",
  async ({ conversationId, isTyping, senderType }: { conversationId: string; isTyping: boolean; senderType: ChatParticipantType }) => {
    if (!conversationId || !senderType) {
      console.warn(`[ChatService] Invalid typing data from userId=${userId}:`, { conversationId, isTyping, senderType });
      socket.emit("error", { message: ERRORMESSAGES.INVALID_INPUT_CHAT.message });
      return;
    }

    try {
      console.log(`[ChatService] Processing typing event: userId=${userId}, conversationId=${conversationId}, isTyping=${isTyping}, senderType=${senderType}`);
      await this.joinConversationUseCase.verifyParticipation(userId, conversationId);
      const payload = { userId, senderType, isTyping, conversationId };
      console.log(`[ChatService] Broadcasting typing event to conversationId=${conversationId}:`, payload);
      this.broadcastToAllNamespaces(
        conversationId,
        "conversation:typing",
        payload,
        socket // Exclude sender
      );
    } catch (error: any) {
      console.error(`[ChatService] Error processing typing event for userId=${userId}, conversationId=${conversationId}:`, error.message);
      socket.emit("error", { message: error.message || ERRORMESSAGES.SERVER_ERROR_CHAT.message });
    }
  }
);

      // Mark message read
      socket.on("markMessageRead", async (data: IMarkMessageReadRequestDTO) => {
        if (!data.conversationId || !data.userId) {
          console.warn(`[ChatService] Invalid markMessageRead data from userId=${userId}:`, data);
          socket.emit("error", { message: ERRORMESSAGES.INVALID_INPUT_CHAT.message });
          return;
        }

        try {
          const participantType = this.roleType === "user" ? ChatParticipantType.USER : ChatParticipantType.TRAINER;
          const result: IMarkMessageReadResponseDTO = await this.markMessageReadUseCase.execute({
            ...data,
            participantType,
          });

          if (result.success) {
            socket.emit("markReadAck", { success: true });
            this.broadcastToAllNamespaces(data.conversationId, "messageRead", {
              messageId: data.messageId,
              userId: data.userId,
              participantType,
              conversationId: data.conversationId,
            });
          } else {
            socket.emit("markReadAck", {
              success: false,
              error: result.error?.message || ERRORMESSAGES.SERVER_ERROR_CHAT.message,
            });
          }
        } catch (error: any) {
          console.error(`[ChatService] Error marking message read for userId=${userId}:`, error);
          socket.emit("markReadAck", {
            success: false,
            error: error.message || ERRORMESSAGES.SERVER_ERROR_CHAT.message,
          });
        }
      });

      // Get room members (for debugging)
      socket.on("getRoomMembers", async (conversationId: string) => {
        try {
          const socketsInRoom = await this.io.in(conversationId).allSockets();
          socket.emit("roomMembers", { conversationId, members: Array.from(socketsInRoom) });
          console.log(`[ChatService] Sent room members for conversationId=${conversationId}:`, Array.from(socketsInRoom));
        } catch (error: any) {
          console.error(`[ChatService] Error fetching room members for conversationId=${conversationId}:`, error);
          socket.emit("error", { message: ERRORMESSAGES.SERVER_ERROR_CHAT.message });
        }
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log(`[ChatService] Socket disconnected: ${socket.id} for userId=${userId}`);
        const userSockets = this.connectedUsers.get(userId);
        if (userSockets) {
          userSockets.delete(socket);
          if (userSockets.size === 0) {
            this.connectedUsers.delete(userId);
            this.broadcastUserStatus(userId, "offline");
          }
        }
      });
    });
  }

  /**
   * Broadcasts user status (online/offline) to all conversations the user is part of.
   */
private async broadcastUserStatus(userId: string, status: "online" | "offline") {
  try {
    const conversations: UserConversationDTO[] = await this.getUserConversationsUseCase.execute(userId);
    console.log(`[ChatService] Retrieved ${conversations.length} conversations for userId=${userId}`);
    for (const conversation of conversations) {
      console.log(`[ChatService] Broadcasting userStatus=${status} for userId=${userId} to conversationId=${conversation.id}`);
      this.broadcastToAllNamespaces(conversation.id, "userStatus", { userId, status });
    }
    console.log(`[ChatService] Successfully broadcasted ${status} status for userId=${userId}`);
  } catch (error) {
    console.error(`[ChatService] Error broadcasting status for userId=${userId}:`, error);
  }
}
}