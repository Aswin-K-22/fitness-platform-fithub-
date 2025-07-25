/* eslint-disable @typescript-eslint/no-explicit-any */
// src/infra/api/adminApi.ts
import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import type { GetUsersResponse, User } from "../../types/user.types";
import type { IGetGymsResponseDTO } from "../../types/dtos/IGetGymsResponseDTO";
import type { IGetMembershipPlansResponseDTO } from "../../types/dtos/IGetMembershipPlansResponseDTO";
import type { IAddMembershipPlanRequestDTO } from "../../types/dtos/IAddMembershipPlanRequestDTO";
import type { IGetPendingTrainersResponseDTO } from "../../types/trainer.type";
import type { IGetTrainersResponseDTO } from "../../types/dtos/IGetTrainersResponseDTO";
import type { FetchPTPlansResponse } from "../../types/pTPlan";

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
      data: response.data.data,
      admin: response.data.data.admin,
    });
    return { admin: response.data.data.admin };
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
  await apiClient.post("/auth/logout", { email });
};

export const getAdmin = async () => {
  const response = await apiClient.get("/auth/get");
  console.log('get admin response ',response)
  return { admin: response.data.data.user };
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
    users: response.data.data.users, // Backend already maps to simplified structure
    totalPages: response.data.data.totalPages,
    totalUsers: response.data.data.totalUsers,
  };
};



export const addGym = async (data: FormData): Promise<any> => {
  const response = await apiClient.post("/addGym", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

export const getAvailableTrainers = async (): Promise<{ id: string; name: string; active: boolean }[]> => {
  const response = await apiClient.get("/available-trainers");
  return response.data.data.trainers; 
};

export const getGyms = async (page: number, limit: number, search?: string): Promise<IGetGymsResponseDTO> => {
  const response = await apiClient.get("/gyms", {
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
    gyms: response.data.data.gyms.map((gym: any) => ({
      id: gym.id,
      name: gym.name || "N/A",
      description: gym.description || "N/A",
      address: gym.address || {},
      contact: gym.contact || {},
      images: gym.images || [],
      ratings: gym.ratings || {},
      facilities: gym.facilities || {},
    })),
    total: response.data.data.total || 0,
    totalPages: response.data.data.totalPages || 1,
  };
};

export const trainersList = async (page: number, limit: number) => {
  const response = await apiClient.get(`/admin/trainers?page=${page}&limit=${limit}`);
  return response.data.data;
};

export const toggleUserVerification = async (id: string): Promise<User> => {
  const response = await apiClient.put(`/users/${id}/toggle-verification`);
  console.log("Raw backend response:", response.data); 
  console.log('Raw backend response:', response.data);
  return response.data.data.user;
};

export const getMembershipPlans = async (page: number, limit: number): Promise<IGetMembershipPlansResponseDTO> => {
  try{
  const response = await apiClient.get("/membership-plans", {
    params: { page, limit },
  });
 return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch membership plans');
  }
};

export const addMembershipPlan = async (data: IAddMembershipPlanRequestDTO): Promise<void> => {
  try {
    await apiClient.post('/membership-plans', data);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create membership plan');
  }
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
  const response = await apiClient.get(`/trainers`, {
    params: {
      page,
      limit,
      search,
      status,
      specialization,
    
      _t: Date.now(), 
    },
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
  console.log("API response for trainers:", { search, status, specialization }, "Trainers:", response.data);
  return {
    trainers: response.data.data.trainers.map((trainer: any) => ({
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
      totalTrainers: response.data.data.stats.totalTrainers || 0,
      pendingApproval: response.data.data.stats.pendingApproval || 0,
      activeTrainers: response.data.data.stats.activeTrainers || 0,
      suspended: response.data.data.stats.suspended || 0,
    },
    totalPages: response.data.data.totalPages || 1,
  };
};


 export const   getTrainerDetails = async (trainerId: string): Promise<any>=>{
    const response = await apiClient.get(`/trainers/${trainerId}`);
    return response.data;
  }

   export const approveTrainer =   async (trainerId: string): Promise<void>=> {
    await apiClient.put(`/trainers/${trainerId}/toggle-approval`);
  }

export const fetchTrainerPTPlans = async (
  page: number,
  limit: number,
  verifiedByAdmin: boolean | null = null,
): Promise<FetchPTPlansResponse> => {
  try {
    const response = await apiClient.get('/plans', {
      params: { page, limit, verifiedByAdmin },
      withCredentials: true,
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch PT plans:', error);
    throw error;
  }
};

export const verifyPTPlan = async (planId: string): Promise<void> => {
  try {
    await apiClient.patch(`/plans/${planId}/verify`, { verifiedByAdmin: true });
  } catch (error: any) {
    console.error('Failed to verify PT plan:', error);
    throw new Error(error.response?.data?.message || 'Failed to verify PT plan');
  }
};

export const updatePTPlanAdminPrice = async (planId: string, adminPrice: number): Promise<void> => {
  try {
    await apiClient.patch(`/plans/${planId}`, { adminPrice });
  } catch (error: any) {
    console.error('Failed to update PT plan admin price:', error);
    throw new Error(error.response?.data?.message || 'Failed to update PT plan admin price');
  }
};