//src/store/slice/userAuthSlice.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { login as userLogin , logout as userLogout  , getUser } from "../../services/api/userApi";
import type { UserAuth } from "../../types/auth.types";
import type { ILoginRequestDTO } from "../../types/dtos/ILoginRequestDTO";

interface AuthState {
  user: UserAuth | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const loginThunk = createAsyncThunk(
  "userAuth/login",
  async (data: ILoginRequestDTO, { rejectWithValue }) => {
    try {
      const response = await userLogin(data.email, data.password);
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const logoutThunk = createAsyncThunk(
  "userAuth/logout",
  async (email: string, { rejectWithValue }) => {
    try {
      console.log('user logout thunk triggered')
      await userLogout(email);
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

export const fetchAuthUser = createAsyncThunk(
  "userAuth/fetchAuth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUser();
      console.log('from UserAuthslic fetchAuthUser method result ',response.user)
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to authenticate user");
    }
  }
);

const userAuthSlice = createSlice({
  name: "userAuth",
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ user: UserAuth | null; isAuthenticated: boolean }>) {
      state.user = action.payload.user;
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
        state.user = {
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
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAuthUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAuthUser.fulfilled, (state, action) => {
        state.user = {
          ...action.payload,
          isVerified: action.payload.isVerified ?? false,
        };
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchAuthUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.user = null;
        state.isAuthenticated = false;
      });
    
  },
});

export const { setAuth, setLoading, setError } = userAuthSlice.actions;
export default userAuthSlice.reducer;