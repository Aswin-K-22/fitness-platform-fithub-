// src/infra/api/trainerApi.ts
import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import type { ILoginResponseDTO } from "../../types/dtos/ILoginResponseDTO";
import type { ITrainerSignupRequestDTO } from "../../types/dtos/ITrainerSignupRequestDTO";
import type { IVerifyOtpRequestDTO } from "../../types/dtos/VerifyOtpRequestDTO";
import type { IResendOtpRequestDTO } from "../../types/dtos/IResendOtpRequestDTO";
import type { TrainerProfileData } from "../../types/trainer.type";
import type { IUpdateTrainerProfileRequestDTO } from "../../types/dtos/IUpdateTrainerProfileRequestDTO";
import type { ITrainerDashboardResponseDTO } from "../../types/dtos/ITrainerDashboardResponseDTO";


const apiClient = axios.create({
  baseURL: "/api/trainer",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});


const refreshClient = axios.create({
  baseURL: "/api/trainer",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

interface QueueItem {
  resolve: (value?: unknown) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        const refreshResponse = await refreshClient.post("/auth/trainer/refresh-token");
        console.log("Trainer token refreshed successfully:", refreshResponse.data);
        localStorage.setItem("TrainerData", JSON.stringify(refreshResponse.data.trainer));
        isRefreshing = false;
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Trainer token refresh failed:", refreshError);
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





export const trainerLogin = async (email: string, password: string): Promise<ILoginResponseDTO> => {
  const response = await apiClient.post("/auth/trainer/login", { email, password });
  return response.data;
};

export const signupTrainer = async (data: ITrainerSignupRequestDTO) => {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("email", data.email);
  formData.append("password", data.password);
  formData.append("experienceLevel", data.experienceLevel);
  formData.append("specialties", JSON.stringify(data.specialties));
  formData.append("bio", data.bio);
  data.certifications.forEach((cert, index) => {
    formData.append(`certifications[${index}][name]`, cert.name);
    formData.append(`certifications[${index}][issuer]`, cert.issuer);
    formData.append(`certifications[${index}][dateEarned]`, cert.dateEarned);
    formData.append(`certifications[${index}][file]`, cert.file);
  });

  const response = await apiClient.post("/auth/trainer/signup", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const verifyTrainerOtp = async (data: IVerifyOtpRequestDTO): Promise<void> => {
  const response = await apiClient.post("/auth/trainer/verify-otp", data);
  return response.data;
};
export const getTrainer = async () => {
  const response = await apiClient.get("/auth/get", { withCredentials: true });
  return { trainer : response.data.trainer };
};

export const resendTrainerOtp = async (data: IResendOtpRequestDTO): Promise<void> => {
  await apiClient.post("/auth/trainer/resend-otp", data);
};

export const trainerLogout = async (email: string) => {
  const response = await apiClient.post("/trainer/logout", { email });
  return response.data;
};

export const getTrainerProfile = async (): Promise<{ trainer: TrainerProfileData }> => {
  const response = await apiClient.get("/trainer/profile");
  return response.data;
};

export const updateTrainerProfile = async (data: IUpdateTrainerProfileRequestDTO) => {
  const formData = new FormData();
  if (data.name) formData.append("name", data.name);
  if (data.bio) formData.append("bio", data.bio);
  if (data.specialties) formData.append("specialties", JSON.stringify(data.specialties));
  if (data.profilePic) formData.append("profilePic", data.profilePic);
  if (data.upiId) formData.append("upiId", data.upiId);
  if (data.bankAccount) formData.append("bankAccount", data.bankAccount);
  if (data.ifscCode) formData.append("ifscCode", data.ifscCode);
  const response = await apiClient.put("/trainer/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getTrainerDashboardData = async (): Promise<ITrainerDashboardResponseDTO> => {
  // Mock data for now; replace with real API call
  return {
    stats: { todaysSessions: "8", activeClients: "24", monthlyEarnings: "$4,250", averageRating: "4.9" },
    sessions: [
      {
        name: "Sarah Johnson",
        type: "Strength Training",
        time: "9:00 AM - 10:00 AM",
        avatar: "/images/user.jpg",
      },
      {
        name: "David Miller",
        type: "HIIT Workout",
        time: "10:30 AM - 11:30 AM",
       avatar: "/images/user.jpg",
      },
    ],
    notifications: [
      { icon: "fa-bell", text: "New booking request from Emma Wilson", time: "5 minutes ago", color: "text-indigo-600" },
      { icon: "fa-check", text: "Session completed with John Davis", time: "1 hour ago", color: "text-green-600" },
    ],
    chats: [
      { name: "Sarah Johnson", status: "Online", avatar: "/images/user.jpg", },
      { name: "David Miller", status: "Last seen 5m ago",avatar: "/images/user.jpg", },
    ],
    performance: {
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      sessions: [5, 7, 6, 8, 9, 6, 4],
      revenue: [250, 350, 300, 400, 450, 300, 200],
    },
  };
  // Uncomment for real API call:
  // const response = await apiClient.get("/trainer/dashboard");
  // return response.data;
};

