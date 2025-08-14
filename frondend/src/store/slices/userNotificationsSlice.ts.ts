import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface IUserNotification {
  id: string;
  userId: string;
  message: string;
  type: "success" | "error" | "info";
  createdAt: string;
  read: boolean;
}

interface UserNotificationsState {
  notifications: IUserNotification[];
  unreadCount: number;
}

const initialState: UserNotificationsState = {
  notifications: [],
  unreadCount: 0,
};

const userNotificationsSlice = createSlice({
  name: "userNotifications",
  initialState,
  reducers: {
    setUserNotifications(state, action: PayloadAction<IUserNotification[]>) {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.read).length;
    },
    addUserNotification(state, action: PayloadAction<IUserNotification>) {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) state.unreadCount += 1;
    },
    markUserNotificationRead(state, action: PayloadAction<string>) {
      const n = state.notifications.find((x) => x.id === action.payload);
      if (n && !n.read) {
        n.read = true;
        state.unreadCount = Math.max(state.unreadCount - 1, 0);
      }
    },
    resetUserNotifications(state) {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
});

export const {
  setUserNotifications,
  addUserNotification,
  markUserNotificationRead,
  resetUserNotifications,
} = userNotificationsSlice.actions;

export default userNotificationsSlice.reducer;
