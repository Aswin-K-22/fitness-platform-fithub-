/* eslint-disable @typescript-eslint/no-explicit-any */


import { fetchAuthAdmin , setError as setAdminError} from "../store/slices/adminAuthSlice";
import { fetchAuthTrainer , setError as setTrainerError } from "../store/slices/trainerAuthSlice";
import { fetchAuthUser ,setError} from "../store/slices/userAuthSlice";
import type { AppDispatch, RootState } from "../store/store";

export const initializeAuth = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  console.log("initializeAuth function called");
  const { adminAuth, trainerAuth, userAuth } = getState();
  console.log('Initial Load state values  :-','adminAuth=',adminAuth,'userAuth',userAuth,'trainerAuth',trainerAuth)
  if (
    adminAuth.isAuthenticated ||
    trainerAuth.isAuthenticated ||
    userAuth.isAuthenticated ||
    adminAuth.isLoading ||
    trainerAuth.isLoading ||
    userAuth.isLoading
  ) {
    return;
  }

  const results = await Promise.allSettled([
   dispatch(fetchAuthAdmin()),
   //dispatch(fetchAuthTrainer()),
   // dispatch(fetchAuthUser()),
  ]);

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      const errorMessage = result.reason?.payload || "Failed to verify session";
      if (index === 0) {
        dispatch(setAdminError(errorMessage));
      } else if (index === 1) {
        dispatch(setTrainerError(errorMessage));
      } else {
        dispatch(setError(errorMessage));
      }
      console.error(`Auth check failed for ${index === 0 ? "admin" : index === 1 ? "trainer" : "user"}:`, errorMessage);
    }
  });
};