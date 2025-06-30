import { configureStore } from "@reduxjs/toolkit";
import adminAuthReducer from "./slices/adminAuthSlice";
import trainerAuthReducer from "./slices/trainerAuthSlice";
import userAuthReducer from "./slices/userAuthSlice";

export const store = configureStore({
  reducer: {
    adminAuth: adminAuthReducer,
    trainerAuth: trainerAuthReducer,
    userAuth: userAuthReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;