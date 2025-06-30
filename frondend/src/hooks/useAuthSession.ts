/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import type { RootState } from "../store/store";

// Input selectors for each slice
const selectAdminAuth = (state: RootState) => state.adminAuth;
const selectTrainerAuth = (state: RootState) => state.trainerAuth;
const selectUserAuth = (state: RootState) => state.userAuth;

// Memoized selector
const selectAuthSession = createSelector(
  [selectAdminAuth, selectTrainerAuth, selectUserAuth],
  (adminAuth, trainerAuth, userAuth) => ({
    adminAuth,
    trainerAuth,
    userAuth,
  })
);

export const useAuthSession = () => {
  const { adminAuth, trainerAuth, userAuth } = useSelector(selectAuthSession);

  return {
    isAdminAuthenticated: adminAuth.isAuthenticated,
    isTrainerAuthenticated: trainerAuth.isAuthenticated,
    isUserAuthenticated: userAuth.isAuthenticated,
    isAdminLoading: adminAuth.isLoading,
    isTrainerLoading: trainerAuth.isLoading,
    isUserLoading: userAuth.isLoading,
    admin: adminAuth.admin,
    trainer: trainerAuth.trainer,
    user: userAuth.user,
  };
};