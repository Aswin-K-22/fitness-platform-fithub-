// src/services/sockets/userSocket.ts
import { io, Socket } from "socket.io-client";
import { store } from "../../store/store";
import { getNotifications } from "../api/userApi";
import { addUserNotification, markUserNotificationRead, setUserNotifications } from "../../store/slices/userNotificationsSlice.ts";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL;

let socket: Socket | null = null;

/**
 * Initializes the socket connection for the logged-in user
 * This should only be called AFTER the user is authenticated
 */
export function initUserSocket() {
  if (socket) {
   // console.log("[userSocket] initUserSocket() called but socket already exists");
    return socket;
  }

  //console.log("[userSocket] Creating new Socket.io connection...");

  socket = io(`${SOCKET_URL}/user`, {
    transports: ["websocket"],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    autoConnect: false // we explicitly connect after login
  });

  /**
   * On initial connect
   */
  socket.on("connect", async () => {
    console.log(`✅ [userSocket] Connected: ${socket?.id}`);
    joinUserRoom();

    try {
     // console.log("[userSocket] Fetching notifications after connect...");
      const { notifications } = await getNotifications(1, 10);
    //  console.log(`[userSocket] ${notifications.length} notifications fetched`);
      store.dispatch(setUserNotifications(notifications));
    } catch (err) {
      console.error("[userSocket] Failed to fetch notifications after connect", err);
    }
  });

  /**
   * On reconnect
   */
  socket.on("reconnect", (attempt) => {
    console.log(`[userSocket] Reconnected on attempt #${attempt}`);
    joinUserRoom();
  });

  /**
   * Other socket lifecycle events
   */
  socket.on("disconnect", (reason) => {
    console.warn(`⚠️ [userSocket] Disconnected: ${reason}`);
  });

  socket.on("connect_error", (err) => {
    console.error(`❌ [userSocket] Connection error: ${err.message}`);
  });

  /**
   * Business events
   */
  socket.on("notification", (notif) => {
   // console.log("📩 [userSocket] Notification received:", notif);
    store.dispatch(addUserNotification(notif));
  });

  socket.on("unreadCount", (count) => {
    console.log(`🔢 [userSocket] Unread notification count: ${count}`);
  });


socket.on('notificationRead', ({ notificationId }) => {
  store.dispatch(markUserNotificationRead(notificationId));
});


  return socket;
}

/**
 * Helper: Join the user's personal room
 */
function joinUserRoom() {
  const userId = store.getState().userAuth.user?.id;
  if (socket && userId) {
    //console.log(`[userSocket] Emitting 'join' for userId=${userId}`);
    socket.emit("join", userId);
  } else {
   // console.warn("[userSocket] Cannot join room — missing socket or userId");
  }
}

/**
 * Explicit connect - call after successful login
 */
export function connectUserSocket() {
  if (!socket) {
    initUserSocket();
  }
  if (socket && !socket.connected) {
    //console.log("[userSocket] Connecting...");
    socket.connect();
  } else {
    //console.log("[userSocket] Already connected");
  }
}

/**
 * Explicit disconnect - call only on logout
 */
export function disconnectUserSocket() {
  if (socket) {
    //console.log(`[userSocket] Disconnecting socket: ${socket.id}`);
    socket.disconnect();
    socket = null;
  } else {
    console.log("[userSocket] No active socket to disconnect");
  }
}

/**
 * Get current socket instance
 */
export function getUserSocket(): Socket | null {
  return socket;
}
