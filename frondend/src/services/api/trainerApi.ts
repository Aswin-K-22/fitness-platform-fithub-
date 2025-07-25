/* eslint-disable @typescript-eslint/no-explicit-any */
// src/service/api/trainerApi.ts
import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import type { ILoginResponseDTO } from "../../types/dtos/ILoginResponseDTO";
import type { ITrainerSignupRequestDTO } from "../../types/dtos/ITrainerSignupRequestDTO";
import type { IVerifyOtpRequestDTO } from "../../types/dtos/VerifyOtpRequestDTO";
import type { IResendOtpRequestDTO } from "../../types/dtos/IResendOtpRequestDTO";
import type { TrainerProfileData } from "../../types/trainer.type";
import type { IUpdateTrainerProfileRequestDTO } from "../../types/dtos/IUpdateTrainerProfileRequestDTO";
import type { ITrainerDashboardResponseDTO } from "../../types/dtos/ITrainerDashboardResponseDTO";
import type { IClient, IClientFeedback, IClientSession, IMessage } from "../../types/dtos/IClientInteractionDTO";
import type { IClientPlan } from "../../types/dtos/IClientPlanDTO";
import type { FetchPTPlansResponse } from "../../types/pTPlan";


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
        const refreshResponse = await refreshClient.post("/refresh-token");
        console.log("Trainer token refreshed successfully:", refreshResponse.data);
       // localStorage.setItem("TrainerData", JSON.stringify(refreshResponse.data.trainer));
        isRefreshing = false;
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Trainer token refresh failed:", refreshError);
        isRefreshing = false;
        processQueue(refreshError as AxiosError);
        document.cookie = "trainerAccessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax";
        document.cookie = "trainerRefreshToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { apiClient, refreshClient };





export const trainerLogin = async (email: string, password: string): Promise<ILoginResponseDTO> => {
  const response = await apiClient.post("/auth/login", { email, password });
  return response.data.data;
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
for (const [key, value] of formData.entries()) {
    console.log(`FormData Entry: ${key} = ${value}`);
  }
  const response = await apiClient.post("/auth/signup", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

export const verifyTrainerOtp = async (data: IVerifyOtpRequestDTO): Promise<void> => {
  const response = await apiClient.post("/verify-otp", data);
  return response.data.data;
};
export const getTrainer = async () => {
  const response = await apiClient.get("/auth/get", { withCredentials: true });
  return { trainer : response.data.data.trainer };
};

export const resendTrainerOtp = async (data: IResendOtpRequestDTO): Promise<void> => {
  await apiClient.post("/auth/resend-otp", data);
};

export const trainerLogout = async (email: string) => {
  const response = await apiClient.post("/auth/logout", { email });
  return response.data.data;
};

export const getTrainerProfile = async (): Promise<{ trainer: TrainerProfileData }> => {
  const response = await apiClient.get("/profile");
  return response.data.data;
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
  console.log('input data from frond end ',formData)
  const response = await apiClient.put("/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
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
        avatar: "/images/trainer.png",
      },
      {
        name: "David Miller",
        type: "HIIT Workout",
        time: "10:30 AM - 11:30 AM",
       avatar: "/images/trainer.png",
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



export const fetchClients = async (): Promise<IClient[]> => {
  // Replace with actual API call
  return [
    {
      id: '1',
      name: 'Sarah Wilson',
      avatar: '/images/trainer.png',
      status: 'Active',
      lastSession: 'Today',
      progress: 75,
      level: 'Beginner',
      lastMessage: 'Thanks for the new workout plan!',
      lastMessageTime: '2m',
      unreadCount: 2,
      isOnline: true,
    },
     {
      
      id: '2',
      name: 'Sarah Johnson',
      avatar: '/images/trainer.png',
      status: 'Active',
      lastSession: 'Today',
      progress: 75,
      level: 'Beginner',
      lastMessage: 'Thanks for the new workout plan!',
      lastMessageTime: '2m',
      unreadCount: 2,
      isOnline: true,
    }
    // Add more mock clients
  ];
};

export const fetchMessages = async (): Promise<IMessage[]> => {
  // Replace with actual API call
  return [
    {
      id: '1',
      sender: 'client',
      content: 'Hi John! Just completed today’s workout. It was challenging but I managed to do all sets! 💪',
      timestamp: '10:30 AM',
    },
    {
      id: '2',
      sender: 'trainer',
      content: 'That’s fantastic, Sarah! Great job pushing through. How was the new ab routine I added?',
      timestamp: '10:32 AM',
    },
  ];
};

export const fetchFeedback = async (): Promise<IClientFeedback> => {
  // Replace with actual API call
  return {
    rating: 4,
    weightChange: '-2.5 lbs this week',
    strengthNote: 'Improving in core exercises',
    energyNote: 'High throughout workouts',
  };
};

export const fetchSessions = async (): Promise<IClientSession[]> => {
  // Replace with actual API call
  return [
    {
      id: '1',
      title: 'HIIT Training',
      time: 'Tomorrow, 9:00 AM',
    },
  ];
};


export const fetchFeedbackW = async (): Promise<any> => {
  // Simulate API call
  return {
    id: '1',
    rating: 4.5,
    comment: 'Great trainer, very motivating!',
  };
};

export const fetchSessionsW = async (): Promise<any> => {
  // Simulate API call
  return [
    {
      id: '1',
      date: '2024-01-15',
      type: 'Strength Training',
      duration: '1h',
    },
    // Add more mock sessions as needed
  ];
};

export const fetchClientPlan = async (clientId: string): Promise<IClientPlan> => {
  // Simulate API call
  return {
    id: clientId,
    name: 'Sarah Johnson',
    startDate: 'Jan 15, 2024',
    goal: 'Weight Loss',
    workouts: [
      {
        id: '1',
        name: 'Squats',
        level: 'Advanced',
        sets: '4 sets',
        reps: '12 reps',
        rest: '60 sec',
      },
      {
        id: '2',
        name: 'Deadlifts',
        level: 'Intermediate',
        sets: '3 sets',
        reps: '10 reps',
        rest: '90 sec',
      },
    ],
    diet: [
      {
        id: '1',
        name: 'Breakfast',
        description: 'Oatmeal with berries and nuts',
        calories: 450,
        protein: 15,
      },
      {
        id: '2',
        name: 'Lunch',
        description: 'Grilled chicken salad',
        calories: 380,
        protein: 32,
      },
    ],
    workoutCompletion: 85,
    dietAdherence: 78,
  };
};

// Add to existing exports
export const createPTPlan = async (data: FormData): Promise<void> => {
  const response = await apiClient.post('/create-plan', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    withCredentials: true,
  });
  return response.data.data;
};



export const fetchPTPlans = async (page: number, limit: number): Promise<FetchPTPlansResponse> => {
  try {
    const response = await apiClient.get('/plans', {
      params: { page, limit },
      withCredentials: true,
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch PT plans:', error);
    throw error;
  }
};


export const stopPTPlan = async (planId: string): Promise<void> => {
  try {
    const response = await apiClient.patch(`/plans/${planId}/stop`, {}, { withCredentials: true });
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to stop plan');
    }
  } catch (error) {
    console.error('Failed to stop PT plan:', error);
    throw error;
  }
};

export const resumePTPlan = async (planId: string): Promise<void> => {
  try {
    const response = await apiClient.patch(`/plans/${planId}/resume`, {}, { withCredentials: true });
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to resume plan');
    }
  } catch (error) {
    console.error('Failed to resume PT plan:', error);
    throw error;
  }
};



export const updatePTPlan = async (planId: string, formData: FormData): Promise<void> => {
  try {
    const response = await apiClient.put(`/plans/${planId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
    if (!response.data.success) {
      throw new Error(response.data.error?.message || "Failed to update PT plan");
    }
    return response.data.data;
  } catch (error) {
    console.error("Failed to update PT plan:", error);
    throw new Error("Failed to update PT plan: " + (error as Error).message);
  }
};