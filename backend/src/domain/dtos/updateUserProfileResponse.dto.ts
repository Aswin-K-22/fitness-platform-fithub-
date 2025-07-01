export interface IUpdateUserProfileResponseDTO {
  success: boolean;
  data?: {
    user: {
      id: string | null;
      name: string;
      email: string;
      password: string | null;
      role: string;
      createdAt: Date;
      updatedAt: Date;
      otp: string | null;
      otpExpires: Date | null;
      isVerified: boolean;
      refreshToken: string | null;
      profilePic: string | null;
      membershipId: string | null;
      fitnessProfile: {
        goals: string[];
        weight?: number | null;
        height?: number | null;
        level?: string | null;
        calorieGoal?: number | null;
        updatedAt?: Date | null;
      } | null;
      workoutPlanId: string | null;
      progress: {
        workoutDate: Date;
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
      }[] | null;
      weeklySummary: {
        weekStart: Date;
        weekEnd: Date;
        totalCaloriesBurned?: number | null;
        weeklyDifficulty?: string | null;
      }[] | null;
      memberships: { id: string }[] | null;
      Bookings: { id: string }[] | null;
      payments: { id: string }[] | null;
    };
  };
  error?: string;
}