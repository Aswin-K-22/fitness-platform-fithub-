/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type {  UserAuth as AdminAuth } from "../../types/auth.types"; 
import { adminLogin , adminLogout ,getAdmin} from "../../services/api/adminApi";
import type { ILoginRequestDTO } from "../../types/dtos/ILoginRequestDTO";

interface AuthState {
  admin: AdminAuth | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  admin: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const loginThunk = createAsyncThunk(
  "adminAuth/login",
  async (data: ILoginRequestDTO, { rejectWithValue }) => {
    try {
      console.log("loginThunk: Sending login request with data:", data);
      const response = await adminLogin(data.email, data.password);
      console.log("loginThunk: Login response:", response);
      return response.admin;
    } catch (error: any) {
      console.error("loginThunk: Login error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const logoutThunk = createAsyncThunk(
  "adminAuth/logout",
  async (email: string, { rejectWithValue }) => {
    try {
      console.log("logoutThunk: Sending logout request for email:", email);
      await adminLogout(email);
      return true;
    } catch (error: any) {
      console.error("logoutThunk: Logout error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

export const fetchAuthAdmin = createAsyncThunk(
  "adminAuth/fetchAuth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAdmin();
      return response.admin;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to authenticate admin");
    }
  }
);

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ admin: AdminAuth | null; isAuthenticated: boolean }>) {
      console.log("setAuth: Updating state with:", action.payload);
      state.admin = action.payload.admin;
      state.isAuthenticated = action.payload.isAuthenticated;
      state.isLoading = false;
      state.error = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      console.log("setLoading: Setting isLoading to:", action.payload);
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      console.log("setError: Setting error to:", action.payload);
      state.error = action.payload;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        console.log("loginThunk.pending: Setting isLoading to true");
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        console.log("loginThunk.fulfilled: Received payload:", action.payload);
        state.admin = {
          ...action.payload,
          isVerified: action.payload.isVerified ?? false,
        };
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
        console.log("loginThunk.fulfilled: Updated state:", state);
      })
      .addCase(loginThunk.rejected, (state, action) => {
        console.log("loginThunk.rejected: Error:", action.payload);
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutThunk.pending, (state) => {
        console.log("logoutThunk.pending: Setting isLoading to true");
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        console.log("logoutThunk.fulfilled: Resetting auth state");
        state.admin = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        console.log("logoutThunk.rejected: Error:", action.payload);
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAuthAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAuthAdmin.fulfilled, (state, action) => {
        state.admin = {
          ...action.payload,
          isVerified: action.payload.isVerified ?? false,
        };
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchAuthAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setAuth, setLoading, setError } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;