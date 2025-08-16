//📂 src/services/sockets/trainerSocket.ts
import { io, Socket } from "socket.io-client";
import { store } from "../../store/store";
import { getTrainerNotifications } from "../api/trainerApi"; 
import {
  addTrainerNotification,
  markTrainerNotificationRead,
  setTrainerNotifications
} from "../../store/slices/trainerNotificationsSlice"; // 👈 trainer slice

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL;

let socket: Socket | null = null;

/**
 * Initializes the socket connection for the logged-in trainer.
 * This should only be called AFTER trainer is authenticated.
 */
export function initTrainerSocket() {
  if (socket) {
    console.log("[trainerSocket] initTrainerSocket() called but socket already exists");
    return socket;
  }

  console.log("[trainerSocket] Creating new Socket.io connection...");

  socket = io(`${SOCKET_URL}/trainer`, {
    transports: ["websocket"],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    autoConnect: false // explicitly connect after login
  });

  /**
   * On initial connect
   */
  socket.on("connect", async () => {
    console.log(`✅ [trainerSocket] Connected: ${socket?.id}`);
    joinTrainerRoom();

    try {
      console.log("[trainerSocket] Fetching notifications after connect...");
      const { notifications } = await getTrainerNotifications(1, 10);
      console.log(`[trainerSocket] ${notifications.length} notifications fetched`);
      store.dispatch(setTrainerNotifications(notifications));
    } catch (err) {
      console.error("[trainerSocket] Failed to fetch notifications after connect", err);
    }
  });

  /**
   * On reconnect
   */
  socket.on("reconnect", (attempt) => {
    console.log(`[trainerSocket] Reconnected on attempt #${attempt}`);
    joinTrainerRoom();
  });

  /**
   * Socket lifecycle events
   */
  socket.on("disconnect", (reason) => {
    console.warn(`⚠️ [trainerSocket] Disconnected: ${reason}`);
  });

  socket.on("connect_error", (err) => {
    console.error(`❌ [trainerSocket] Connection error: ${err.message}`);
  });

  /**
   * Business events
   */
  socket.on("notification", (notif) => {
    console.log("📩 [trainerSocket] Notification received:", notif);
    store.dispatch(addTrainerNotification(notif));
  });

  socket.on("unreadCount", (count) => {
    console.log(`🔢 [trainerSocket] Unread notification count: ${count}`);
  });

  socket.on("notificationRead", ({ notificationId }) => {
    store.dispatch(markTrainerNotificationRead(notificationId));
  });

  return socket;
}

/**
 * Helper: Join trainer personal room
 */
function joinTrainerRoom() {
  const trainerId = store.getState().trainerAuth.trainer?.id; // 👈 from trainer auth state
  if (socket && trainerId) {
    console.log(`[trainerSocket] Emitting 'joinTrainer' for trainerId=${trainerId}`);
    socket.emit("joinTrainer", trainerId); // 👈 use separate namespace/event from users
  } else {
    console.warn("[trainerSocket] Cannot join room — missing socket or trainerId");
  }
}

/**
 * Explicit connect - call after successful login
 */
export function connectTrainerSocket() {
  if (!socket) {
    initTrainerSocket();
  }
  if (socket && !socket.connected) {
    console.log("[trainerSocket] Connecting...");
    socket.connect();
  } else {
    console.log("[trainerSocket] Already connected");
  }
}

/**
 * Explicit disconnect - call only on logout
 */
export function disconnectTrainerSocket() {
  if (socket) {
    console.log(`[trainerSocket] Disconnecting socket: ${socket.id}`);
    socket.disconnect();
    socket = null;
  } else {
    console.log("[trainerSocket] No active socket to disconnect");
  }
}

/**
 * Get current socket instance
 */
export function getTrainerSocket(): Socket | null {
  return socket;
}
