/* eslint-disable @typescript-eslint/no-explicit-any */
// src/infra/api/userApi.ts
import axios,{ AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import type { UserAuth } from "../../types/auth.types";
import type { IGoogleAuthRequestDTO } from "../../types/dtos/IGoogleAuthRequestDTO";
import type { IGoogleAuthResponseDTO } from "../../types/dtos/IGoogleAuthResponseDTO";
import type { IUserProfileResponseDTO } from "../../types/dtos/IUserProfileResponseDTO";
import type { IGymDetailsDTO } from "../../types/dtos/IGymDetailsDTO";
import type { IVerifyOtpRequestDTO } from "../../types/dtos/VerifyOtpRequestDTO";
import type { IResendOtpRequestDTO } from "../../types/dtos/IResendOtpRequestDTO";
import type { IVerifyOtpResponseDTO } from "../../types/dtos/IVerifyOtpResponseDTO";
import type { Gym } from "../../types/gym.types";
import type { IMembershipPlansResponseDTO } from "../../types/dtos/IMembershipPlansResponseDTO";




const apiClient = axios.create({
  baseURL: "/api/user",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const refreshClient = axios.create({
  baseURL: "/api/user",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

interface QueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean } | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/refresh-token")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await refreshClient.post("/auth/refresh-token");
        console.log("User token refreshed successfully:", refreshResponse.data);
        localStorage.setItem("userData", JSON.stringify(refreshResponse.data.user));
        isRefreshing = false;
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("User token refresh failed:", refreshError);
        isRefreshing = false;
        processQueue(refreshError as AxiosError);
        document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax";
        document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { apiClient, refreshClient };

// User Authentication
export const login = async (email: string, password: string): Promise<{ user: UserAuth }> => {
  const response = await apiClient.post("/auth/login", { email, password });
  return { user: response.data.user };
};

export const signup = async (name: string, email: string, password: string): Promise<void> => {
  await apiClient.post("/auth/signup", { name, email, password });
};

export const googleAuth = async (data: IGoogleAuthRequestDTO): Promise<IGoogleAuthResponseDTO> => {
  console.log("Sending Google auth request with data:", data);
  const response = await apiClient.post("/auth/google", data);
  console.log("Google auth response:", response.data);
  return response.data;
};

export const verifyOtp = async (data: IVerifyOtpRequestDTO): Promise<IVerifyOtpResponseDTO> => {
  const response = await apiClient.post("/auth/verify-otp", data);
  return response.data;
};

export const resendOtp = async (data: IResendOtpRequestDTO): Promise<void> => {
  await apiClient.post("/auth/resend-otp", data);
};

export const logout = async (email: string): Promise<void> => {
  await apiClient.post("/logout", { email });
};

export const getUser = async (): Promise<{ user: UserAuth }> => {
  const response = await apiClient.get("/auth/get");
  return { user: response.data.user };
};

export const getUserProfile = async (): Promise<IUserProfileResponseDTO> => {
  const response = await apiClient.get("/profile");
  return response.data;
};

export const updateUserProfile = async (data: { name?: string; profilePic?: File }): Promise<IUserProfileResponseDTO> => {
  const formData = new FormData();
  if (data.name) formData.append("name", data.name);
  if (data.profilePic) formData.append("profilePic", data.profilePic);
  const response = await apiClient.put("/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const fetchGyms = async (
  page: number,
  limit: number,
  filters: { search?: string; lat?: number; lng?: number; radius?: number; gymType?: string; rating?: string }
): Promise<{ gyms: Gym[]; totalPages: number; totalGyms: number }> => {
  const response = await apiClient.get("/gyms", { params: { page, limit, ...filters } });
  return response.data;
};

export const forgotPassword = async (email: string): Promise<void> => {
  await apiClient.post("/auth/forgot-password", { email });
};

export const resetPassword = async (email: string, otp: string, newPassword: string): Promise<void> => {
  await apiClient.post("/auth/reset-password", { email, otp, newPassword });
};

export const verifyForgotPasswordOtp = async (data: IVerifyOtpRequestDTO): Promise<void> => {
  await apiClient.post("/auth/verify-forgot-password-otp", data);
};

export const getMembershipPlansUser = async (
  page: number = 1, 
  limit: number = 3
): Promise<IMembershipPlansResponseDTO> => {
  const response = await apiClient.get("/membership-plans", { 
    params: { page, limit } 
  });
  return response.data;
};

export const subscribeToPlan = async (planId: string): Promise<{ orderId: string; amount: number; currency: string }> => {
  const response = await apiClient.post("/membership/payment", { planId });
  return response.data;
};

export const verifyPayment = async (data: {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  planId: string;
}): Promise<void> => {
  await apiClient.post("/membership/verify-payment", data);
};

export const fetchGymDetails = async (gymId: string): Promise<IGymDetailsDTO> => {
  const response = await apiClient.get(`/gyms/${gymId}`);
  return response.data.data;
};

/////////////////////////////////////////////////////////////////////////////////

