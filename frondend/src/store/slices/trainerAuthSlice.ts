/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type {   TrainerAuth } from "../../types/auth.types"; 
import { getTrainer,trainerLogout , trainerLogin} from "../../services/api/trainerApi";
import type { ILoginRequestDTO } from "../../types/dtos/ILoginRequestDTO";



interface AuthState {
  trainer: TrainerAuth | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  trainer: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const loginThunk = createAsyncThunk(
  "trainerAuth/login",
  async (data: ILoginRequestDTO, { rejectWithValue }) => {
    try {
      const response =  await trainerLogin(data.email, data.password);
 if (!response.trainer) {
        return rejectWithValue("No trainer data returned");
      }
      return response.trainer as TrainerAuth;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const logoutThunk = createAsyncThunk(
  "trainerAuth/logout",
  async (email: string, { rejectWithValue }) => {
    try {
          await trainerLogout(email);
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

export const fetchAuthTrainer = createAsyncThunk(
  "trainerAuth/fetchAuth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getTrainer();
      if (!response.trainer) {
        return rejectWithValue("No trainer data returned");
      }
      return response.trainer as TrainerAuth;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to authenticate trainer");
    }
  }
);

const trainerAuthSlice = createSlice({
  name: "trainerAuth",
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ trainer: TrainerAuth | null; isAuthenticated: boolean }>) {
      state.trainer = action.payload.trainer;
      state.isAuthenticated = action.payload.isAuthenticated;
      state.isLoading = false;
      state.error = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.trainer = {
          ...action.payload,
          isVerified: action.payload.isVerified ?? false,
        };
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.trainer = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAuthTrainer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAuthTrainer.fulfilled, (state, action) => {
        state.trainer = {
          ...action.payload,
          isVerified: action.payload.isVerified ?? false,
        };
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchAuthTrainer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setAuth, setLoading, setError } = trainerAuthSlice.actions;
export default trainerAuthSlice.reducer;