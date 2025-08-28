import { configureStore } from "@reduxjs/toolkit";
import adminAuthReducer from "./slices/adminAuthSlice";
import trainerAuthReducer from "./slices/trainerAuthSlice";
import userAuthReducer from "./slices/userAuthSlice";
import userNotificationsReducer from "./slices/userNotificationsSlice.ts";
import trainerNotificationsReducer from "./slices/trainerNotificationsSlice.ts"

export const store = configureStore({
  reducer: {
    adminAuth: adminAuthReducer,
    trainerAuth: trainerAuthReducer,
    userAuth: userAuthReducer,
    userNotifications: userNotificationsReducer, 
    trainerNotifications: trainerNotificationsReducer,
   
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;