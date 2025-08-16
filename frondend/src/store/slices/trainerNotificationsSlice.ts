//src/store/slices/trainerNotificationsSlice.ts


import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ITrainerNotification {
  id: string;
  trainerId: string;
  message: string;
  type: "success" | "error" | "info";
  createdAt: string;
  read: boolean;
}

interface TrainerNotificationsState {
  notifications: ITrainerNotification[];
  unreadCount: number;
}

const initialState: TrainerNotificationsState = {
  notifications: [],
  unreadCount: 0,
};

const trainerNotificationsSlice = createSlice({
  name: "trainerNotifications",
  initialState,
  reducers: {
    setTrainerNotifications(state, action: PayloadAction<ITrainerNotification[]>) {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.read).length;
    },
    addTrainerNotification(state, action: PayloadAction<ITrainerNotification>) {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) state.unreadCount += 1;
    },
    markTrainerNotificationRead(state, action: PayloadAction<string>) {
      const n = state.notifications.find((x) => x.id === action.payload);
      if (n && !n.read) {
        n.read = true;
        state.unreadCount = Math.max(state.unreadCount - 1, 0);
      }
    },
    resetTrainerNotifications(state) {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
});

export const {
  setTrainerNotifications,
  addTrainerNotification,
  markTrainerNotificationRead,
  resetTrainerNotifications,
} = trainerNotificationsSlice.actions;

export default trainerNotificationsSlice.reducer;
