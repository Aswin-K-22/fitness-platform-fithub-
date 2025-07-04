

export interface User {
  id: string;
  email: string;
  role: string;
  name?: string ;
  createdAt?: string | null;
  updatedAt?: string | null;
  isVerified?: boolean | null;
  membershipId?: string | null;
  fitnessProfile?: {
    goals?: string[];
    weight?: number | null;
    height?: number | null;
    level?: string | null;
    calorieGoal?: number | null;
    updatedAt?: string | null;
  } | null;
  workoutPlanId?: string | null;
  progress?: {
    workoutDate?: string | null;
    planId?: string | null;
    exercisesCompleted?: {
      exerciseId?: string | null;
      name?: string | null;
      sets?: number | null;
      reps?: number | null;
      weight?: number | null;
      duration?: number | null;
      difficulty?: string | null;
      caloriesBurned?: number | null;
    }[];
    totalDuration?: number | null;
    totalCaloriesBurned?: number | null;
    dailyDifficulty?: string | null;
  }[] | null;
  weeklySummary?: {
    weekStart?: string | null;
    weekEnd?: string | null;
    totalCaloriesBurned?: number | null;
    weeklyDifficulty?: string | null;
  }[] | null;
  profilePic?: string | null;
  status?: string;
  membership?: string; 
}

export interface GetUsersResponse {
  users: User[];
  totalPages: number;
  totalUsers :number;
}


export interface UserProfileData {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'trainer';
  createdAt: string;
  isVerified :boolean ;
  updatedAt: string; // Added to match backend response
  profilePic?: string | null;
  fitnessProfile: {
    goals?: string[] | null;
    weight?: number | null;
    height?: number | null;
    level?: string | null;
    calorieGoal?: number | null;
    updatedAt?: string | null;
  } | null; // Allow null to match backend
  workoutPlanId?: string | null;
  progress: {
    workoutDate: string;
    planId: string;
    exercisesCompleted: {
      exerciseId: string;
      name: string;
      sets?: number | null;
      reps?: number | null;
      weight?: number | null;
      duration?: number | null;
      difficulty?: string | null;
      caloriesBurned?: number | null;
    }[];
    totalDuration?: number | null;
    totalCaloriesBurned?: number | null;
    dailyDifficulty?: string | null;
  }[] | null; // Allow null to match backend
  weeklySummary: {
    weekStart: string;
    weekEnd: string;
    totalCaloriesBurned?: number | null;
    weeklyDifficulty?: string | null;
  }[] | null; // Allow null to match backend
}
