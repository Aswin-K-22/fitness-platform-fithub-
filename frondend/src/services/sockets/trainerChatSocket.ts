// src/services/sockets/trainerChatSocket.ts
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

export function initTrainerChatSocket() {
  if (socket) return socket;

  socket = io(`${SOCKET_URL}/chat/trainer`, {
    transports: ["websocket"],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    autoConnect: false,
  });

  socket.on("connect", () => console.log(`✅ [trainerChatSocket] Connected: ${socket?.id}`));
  socket.on("disconnect", (reason) => console.warn(`⚠️ [trainerChatSocket] Disconnected: ${reason}`));
  socket.on("connect_error", (err) => console.error(`❌ [trainerChatSocket] Connection error: ${err.message}`));

  socket.on("newMessage", (message: MessageDTO) => console.log("📩 [trainerChatSocket] New message:", message));
  socket.on("messageRead", (data: MessageReadEvent) => console.log(`[trainerChatSocket] Message read:`, data));
  socket.on("messageSent", (ack: MessageSentAck) => console.log(`[trainerChatSocket] Message sent ack:`, ack));
  socket.on("markReadAck", (ack: MarkReadAck) => console.log(`[trainerChatSocket] Mark read ack:`, ack));
  socket.on("conversation:typing", (data: TypingEvent) => console.log(`[trainerChatSocket] Typing event:`, data));
  socket.on("userStatus", (data: UserStatusEvent) => console.log(`[trainerChatSocket] User status changed:`, data));

  return socket;
}

export function connectTrainerChatSocket() {
  if (!socket) initTrainerChatSocket();
  if (socket && !socket.connected) socket.connect();
}

export function disconnectTrainerChatSocket() {
  if (socket) { socket.disconnect(); socket = null; }
}

export function joinTrainerConversation(conversationId: string) {
  if (!socket) {
    console.error('[trainerChatSocket] No socket available for joinTrainerConversation');
    return;
  }
  if (!conversationId) {
    console.warn('[trainerChatSocket] Invalid conversationId');
    return;
  }
  console.log(`[trainerChatSocket] Emitting joinConversation with conversationId=${conversationId}`);
  socket.emit('joinConversation', conversationId);
}

export function sendTrainerMessage(payload: SendMessagePayload) {
  socket?.emit("sendMessage", payload);
}

export function markTrainerMessageRead(conversationId: string, messageId?: string) {
  socket?.emit("markMessageRead", { conversationId, messageId });
}

export function trainerTyping(conversationId: string, isTyping: boolean) {
  socket?.emit("typing", { conversationId, isTyping, senderType: "TRAINER" });
}

export function getTrainerChatSocket(): Socket | null {
  return socket;
}
