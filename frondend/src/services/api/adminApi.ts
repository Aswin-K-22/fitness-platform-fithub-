/* eslint-disable @typescript-eslint/no-explicit-any */
// src/infra/api/adminApi.ts
import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import type { GetUsersResponse, User } from "../../types/user.types";
import type { IGetGymsResponseDTO } from "../../types/dtos/IGetGymsResponseDTO";
import type { IGetMembershipPlansResponseDTO } from "../../types/dtos/IGetMembershipPlansResponseDTO";
import type { IAddMembershipPlanRequestDTO } from "../../types/dtos/IAddMembershipPlanRequestDTO";
import type { IGetPendingTrainersResponseDTO } from "../../types/trainer.type";
import type { IGetTrainersResponseDTO } from "../../types/dtos/IGetTrainersResponseDTO";

const apiClient = axios.create({
  baseURL: "/api/admin",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const refreshClient = axios.create({
  baseURL: "/api/admin",
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
        console.log("Admin token refreshed successfully:", refreshResponse.data);
        localStorage.setItem("adminData", JSON.stringify(refreshResponse.data.admin));
        isRefreshing = false;
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Admin token refresh failed:", refreshError);
        isRefreshing = false;
        processQueue(refreshError as AxiosError);
        document.cookie = "adminAccessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax";
        document.cookie = "adminRefreshToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { apiClient, refreshClient };


export const adminLogin = async (email: string, password: string) => {
  try {
    console.log("adminApi: Sending login request with email:", email, "payload:", { email, password });
    const response = await apiClient.post("/auth/login", { email, password });
    console.log("adminApi: Login response:", {
      status: response.status,
      data: response.data,
      admin: response.data.admin,
    });
    return { admin: response.data.user };
  } catch (error: any) {
    console.error("adminApi: Login error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      errorMessage: error.response?.data?.message || "Unknown error",
    });
    throw error; // Re-throw to let loginThunk handle rejectWithValue
  }
};

export const adminLogout = async (email: string): Promise<void> => {
  await apiClient.post("/admin/logout", { email });
};

export const getAdmin = async () => {
  const response = await apiClient.get("/auth/get");
  return { admin: response.data.user };
};

export const getUsers = async (
  page: number = 1,
  limit: number = 3,
  search?: string,
  membership?: string,
  isVerified?: string
): Promise<GetUsersResponse> => {
  const response = await apiClient.get("/users", {
    params: {
      page,
      limit,
      search,
      membership,
      isVerified,
    },
  });
  console.log("API response for params:", { search, membership, isVerified }, "Users:", response.data.users);
  return {
    users: response.data.users.map((user: any) => ({
      id: user.id,
      name: user.name || "N/A",
      email: user.email,
      membership: user.membership || "None",
      status: user.status || "None",
      profilePic: user.profilePic || null,
      isVerified: user.isVerified,
    })),
    totalPages: response.data.totalPages,
  };
};



export const addGym = async (data: FormData): Promise<any> => {
  const response = await apiClient.post("/admin/addGym", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getAvailableTrainers = async (): Promise<{ id: string; name: string; active: boolean }[]> => {
  const response = await apiClient.get("/admin/available-trainers");
  return response.data.trainers; 
};

export const getGyms = async (page: number, limit: number, search?: string): Promise<IGetGymsResponseDTO> => {
  const response = await apiClient.get("/admin/gyms", {
    params: {
      page,
      limit,
      search,
      _t: Date.now(), // Prevent 304 responses
    },
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
  console.log("API response for gyms:", { search }, "Gyms:", response.data.gyms);
  return {
    gyms: response.data.gyms.map((gym: any) => ({
      id: gym.id,
      name: gym.name || "N/A",
      description: gym.description || "N/A",
      address: gym.address || {},
      contact: gym.contact || {},
      images: gym.images || [],
      ratings: gym.ratings || {},
      facilities: gym.facilities || {},
    })),
    total: response.data.total || 0,
    totalPages: response.data.totalPages || 1,
  };
};

export const trainersList = async (page: number, limit: number) => {
  const response = await apiClient.get(`/admin/trainers?page=${page}&limit=${limit}`);
  return response.data;
};

export const toggleUserVerification = async (id: string): Promise<User> => {
  const response = await apiClient.put(`/admin/users/${id}/toggle-verification`);
  const updatedUser = response.data.user; 
  console.log("Raw backend response:", response.data); 
  return {
    id: updatedUser.id,
    email: updatedUser.email,
    role: updatedUser.role,
    name: updatedUser.name || "N/A",
    createdAt: updatedUser.createdAt || null,
    updatedAt: updatedUser.updatedAt || null,
    isVerified: updatedUser.isVerified ?? false,
    membershipId: updatedUser.membershipId || null,
    fitnessProfile: updatedUser.fitnessProfile || null,
    workoutPlanId: updatedUser.workoutPlanId || null,
    progress: updatedUser.progress || null,
    weeklySummary: updatedUser.weeklySummary || null,
    profilePic: updatedUser.profilePic || null,
    status: updatedUser.status || (updatedUser.isVerified ? "Active" : "Suspended"),
    membership: updatedUser.membership || (updatedUser.membershipId ? "Premium" : "N/A"),
  };
};

export const getMembershipPlans = async (page: number, limit: number): Promise<IGetMembershipPlansResponseDTO> => {
  const response = await apiClient.get("/admin/membership-plans", {
    params: { page, limit },
  });
  return response.data;
};

export const addMembershipPlan = async (data: IAddMembershipPlanRequestDTO):Promise<any> => {
  const response = await apiClient.post("/admin/membership-plans", data);
  return response.data;
};


export const getPendingTrainers = async (page: number, limit: number): Promise<IGetPendingTrainersResponseDTO> => {
  const response = await apiClient.get(`/admin/pending-trainers?page=${page}&limit=${limit}`);
  return response.data;
};

export const getTrainers = async (
  page: number = 1,
  limit: number = 3,
  search?: string,
  status?: string,
  specialization?: string,

): Promise<IGetTrainersResponseDTO> => {
  const response = await apiClient.get(`/admin/trainers`, {
    params: {
      page,
      limit,
      search,
      status,
      specialization,
    
      _t: Date.now(), // Prevent 304 responses
    },
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
  console.log("API response for trainers:", { search, status, specialization }, "Trainers:", response.data.trainers);
  return {
    trainers: response.data.trainers.map((trainer: any) => ({
      id: trainer.id,
      name: trainer.name || "N/A",
      email: trainer.email,
      specialties: trainer.specialties || [],
      experienceLevel: trainer.experienceLevel || "N/A",
      verifiedByAdmin: trainer.verifiedByAdmin ?? false,
      isVerified: trainer.isVerified ?? false,
      profilePic: trainer.profilePic || null,
    })),
    stats: {
      totalTrainers: response.data.stats.totalTrainers || 0,
      pendingApproval: response.data.stats.pendingApproval || 0,
      activeTrainers: response.data.stats.activeTrainers || 0,
      suspended: response.data.stats.suspended || 0,
    },
    totalPages: response.data.totalPages || 1,
  };
};


 export const   getTrainerDetails = async (trainerId: string): Promise<any>=>{
    const response = await apiClient.get(`/admin/trainers/${trainerId}`);
    return response.data;
  }