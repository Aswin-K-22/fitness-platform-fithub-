// src/services/sockets/userChatSocket.ts
import { io, Socket } from "socket.io-client";
import type {
  SendMessagePayload,
  MessageSentAck,
  MessageDTO,
  MessageReadEvent,
  TypingEvent,
  UserStatusEvent,
  MarkReadAck
} from "../../types/chat/chatSocket.types";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL;
let socket: Socket | null = null;

export function initUserChatSocket() {
  if (socket) return socket;

  socket = io(`${SOCKET_URL}/chat/user`, {
    transports: ["websocket"],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    autoConnect: false,
  });

  socket.on("connect", () => console.log(`✅ [userChatSocket] Connected: ${socket?.id}`));
  socket.on("disconnect", (reason) => console.warn(`⚠️ [userChatSocket] Disconnected: ${reason}`));
  socket.on("connect_error", (err) => console.error(`❌ [userChatSocket] Connection error: ${err.message}`));

  // Events from backend
  socket.on("userStatus", (data: UserStatusEvent) => console.log(`[userChatSocket] User status:`, data));
  socket.on("conversation:typing", (data: TypingEvent) => console.log(`[userChatSocket] Typing:`, data));
  socket.on("newMessage", (message: MessageDTO) => console.log("📩 [userChatSocket] Message received:", message));
  socket.on("messageSent", (ack: MessageSentAck) => console.log(`[userChatSocket] Message sent ack:`, ack));
  socket.on("messageRead", (data: MessageReadEvent) => console.log(`[userChatSocket] Message read:`, data));
  socket.on("markReadAck", (ack: MarkReadAck) => console.log(`[userChatSocket] Mark read ack:`, ack));

  return socket;
}

export function connectUserChatSocket() {
  if (!socket) initUserChatSocket();
  if (socket && !socket.connected) socket.connect();
}

export function disconnectUserChatSocket() {
  if (socket) { socket.disconnect(); socket = null; }
}

export function joinUserConversation(conversationId: string) {
  if (!socket) {
    console.error('[userChatSocket] No socket available for joinUserConversation');
    return;
  }
  console.log(`[userChatSocket] Emitting joinConversation with conversationId=${conversationId}`);
  socket.emit('joinConversation', conversationId);
}

export function sendUserMessage(payload: SendMessagePayload) {
  socket?.emit("sendMessage", payload);
}

export function emitUserTyping(conversationId: string, isTyping: boolean) {
  if (!socket || !conversationId) {
    console.warn(`[userChatSocket] Cannot emit typing event: socket=${!!socket}, conversationId=${conversationId}`);
    return;
  }
  console.log(`[userChatSocket] Emitting typing event: conversationId=${conversationId}, isTyping=${isTyping}`);
  socket.emit("typing", { conversationId, isTyping, senderType: "USER" });
}

export function markUserMessageRead(conversationId: string, messageId?: string) {
  socket?.emit("markMessageRead", { conversationId, messageId });
}

export function getUserChatSocket(): Socket | null {
  return socket;
}
